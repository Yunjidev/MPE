const { sequelize } = require("../../../models/index");
const Enterprise = sequelize.models.Enterprise;
const files = require("../../utils/files");
const { calculateAverageRatingForEnterprise } = require("../../utils/ratings");

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeEnterprise(enterprise) {
  const query = [enterprise.zip_code, enterprise.city, "France"]
    .filter(Boolean)
    .join(" ");
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "User-Agent": "MPE-App/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // geocoding failed, skip
  }
  return null;
}

exports.getNearbyEnterprises = async (req, res) => {
  const { lat, lng, dist = 20 } = req.query;
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radius = parseFloat(dist);

  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ error: "Paramètres lat/lng invalides." });
  }

  try {
    const enterprises = await Enterprise.findAll({
      where: { isValidate: true },
      include: [
        { model: sequelize.models.Job, as: "job", attributes: { exclude: ["createdAt", "updatedAt"] } },
        { model: sequelize.models.Country, as: "country", attributes: { exclude: ["createdAt", "updatedAt"] } },
      ],
      attributes: { exclude: ["createdAt", "updatedAt", "User_id", "siret_number"] },
    });

    // Geocode enterprises that don't have coordinates yet (batch, one at a time to respect Nominatim rate limit)
    const toGeocode = enterprises.filter((e) => e.latitude == null || e.longitude == null);
    for (const e of toGeocode) {
      const coords = await geocodeEnterprise(e);
      if (coords) {
        e.latitude = coords.lat;
        e.longitude = coords.lng;
        await Enterprise.update(
          { latitude: coords.lat, longitude: coords.lng },
          { where: { id: e.id } }
        );
      }
      // small delay to respect Nominatim's 1 req/sec policy
      await new Promise((r) => setTimeout(r, 1100));
    }

    const nearby = [];
    for (const e of enterprises) {
      if (e.latitude == null || e.longitude == null) continue;
      const distKm = haversineKm(userLat, userLng, e.latitude, e.longitude);
      if (distKm <= radius) {
        const plain = e.toJSON();
        if (plain.logo) plain.logo = files.getUrl(req, "enterprises/logo", plain.logo);
        if (plain.job?.picture) plain.job.picture = files.getUrl(req, "jobs/picture", plain.job.picture);
        plain.averageRating = await calculateAverageRatingForEnterprise(e.id);
        plain.distanceKm = Math.round(distKm * 10) / 10;
        nearby.push(plain);
      }
    }

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
