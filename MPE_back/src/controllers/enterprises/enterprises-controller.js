const { sequelize } = require("../../../models/index");
const { getIo } = require("../../io");
const Enterprise = sequelize.models.Enterprise;
const { Job, User, Country } = require("../../../models/index");
const files = require("../../utils/files");
const sendEmail = require("../../mailers/email-service");
const { ensureUniqueSlug } = require("../../utils/slugify");

exports.createEnterprise = async (req, res) => {
  try {
    const {
      name,
      phone,
      mail,
      adress,
      city,
      zip_code,
      siret_number,
      description,
      website,
      facebook,
      instagram,
      twitter,
      Job_id,
      Country_id,
    } = req.body;
    const parseArr = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } };
    const payment_methods = parseArr(req.body.payment_methods);
    const service_types   = parseArr(req.body.service_types);
    const languages       = parseArr(req.body.languages);
    const rawLogo = req.files?.logo?.[0]?.path || null;
    const rawPhotos = req.files?.photos?.map((f) => f.path) || [];
    const logo   = rawLogo            ? await files.toWebP(rawLogo)             : null;
    const photos = await Promise.all(rawPhotos.map((p) => files.toWebP(p)));
    const job = await Job.findByPk(Job_id);
    if (!job) {
      return res.status(404).json({ errors: "Pas de job trouvé" });
    }
    const country = await Country.findByPk(Country_id);
    if (!country) {
      return res.status(404).json({ errors: "Pas de Region trouvé" });
    }
    if (!req.user.firstname && !req.user.lastname) {
      return res
        .status(400)
        .json({ errors: "Veuillez renseigner votre nom et votre prénom" });
    }

    if (!req.user.isEntrepreneur) {
      req.user.isEntrepreneur = true;
      await req.user.save();
    }
    const slug = await ensureUniqueSlug(name, Enterprise);
    const newEnterprise = await Enterprise.create({
      name,
      slug,
      phone,
      mail,
      adress,
      city,
      zip_code,
      siret_number,
      description,
      website,
      facebook,
      instagram,
      twitter,
      photos,
      logo,
      User_id: req.user.id,
      Job_id,
      Country_id,
      payment_methods,
      service_types,
      languages,
    });
    let enterpriseData = {
      id: newEnterprise.id,
      slug: newEnterprise.slug,
      name: newEnterprise.name,
      isValidate: newEnterprise.isValidate,
    };
    if (newEnterprise.logo) {
      enterpriseData.logo = files.getUrl(
        req,
        "enterprises/logo",
        newEnterprise.logo,
      );
    }
    res
      .status(201)
      .json({ enterprise: enterpriseData, message: "Entreprise créée" });

    sendEmail(
      req.user.email,
      "Votre entreprise est en cours de validation — Proxilio",
      "enterprise-pending",
      { user: req.user.username, enterprise: newEnterprise.name },
    ).catch((err) => console.error("sendEmail enterprise-pending:", err));
  } catch (error) {
    console.error("createEnterprise error:", error);
    const msg = error.errors
      ? error.errors.map((e) => e.message || e).join(", ")
      : error.message || "Erreur serveur";
    res.status(500).json({ errors: msg });
  }
};

exports.updateEnterprise = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    const {
      name,
      phone,
      mail,
      adress,
      city,
      zip_code,
      description,
      website,
      facebook,
      instagram,
      twitter,
      isValidate,
      multi_booking,
      tva_number, legal_form, legal_status, rcs_number, rm_number,
      Job_id,
      Country_id,
      removeLogo,
      removePhotos,
    } = req.body;

    if (name && name !== enterprise.name) {
      enterprise.slug = await ensureUniqueSlug(name, Enterprise, enterprise.id);
    }
    enterprise.name = name || enterprise.name;
    enterprise.phone = phone || enterprise.phone;
    enterprise.mail = mail || enterprise.mail;
    enterprise.adress = adress || enterprise.adress;
    enterprise.city = city || enterprise.city;
    enterprise.zip_code = zip_code || enterprise.zip_code;
    enterprise.description = description || enterprise.description;
    enterprise.website = website || enterprise.website;
    enterprise.facebook = facebook || enterprise.facebook;
    enterprise.instagram = instagram || enterprise.instagram;
    enterprise.twitter = twitter || enterprise.twitter;
    enterprise.Country_id = Country_id || enterprise.Country_id;
    enterprise.Job_id = Job_id || enterprise.Job_id;
    if (multi_booking !== undefined) {
      enterprise.multi_booking = multi_booking === true || multi_booking === "true";
    }
    if (tva_number   !== undefined) enterprise.tva_number   = tva_number   || null;
    if (legal_form   !== undefined) enterprise.legal_form   = legal_form   || null;
    if (legal_status !== undefined) enterprise.legal_status = legal_status || null;
    if (rcs_number   !== undefined) enterprise.rcs_number   = rcs_number   || null;
    if (rm_number    !== undefined) enterprise.rm_number    = rm_number    || null;

    const parseArr = (v) => { if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } };
    if (req.body.payment_methods !== undefined) enterprise.payment_methods = parseArr(req.body.payment_methods);
    if (req.body.service_types   !== undefined) enterprise.service_types   = parseArr(req.body.service_types);
    if (req.body.languages       !== undefined) enterprise.languages       = parseArr(req.body.languages);

    if (req.user.isAdmin) {
      const wasValidated = enterprise.isValidate;
      enterprise.isValidate = isValidate !== undefined ? isValidate : enterprise.isValidate;

      if (!wasValidated && enterprise.isValidate === true) {
        const owner = await User.findByPk(enterprise.User_id);
        if (owner) {
          sendEmail(
            owner.email,
            "Votre entreprise est validée — Proxilio",
            "enterprise-validated",
            {
              user: owner.username,
              enterprise: enterprise.name,
              url: `${process.env.CLIENT_URL}/enterprise/${enterprise.slug || enterprise.id}`,
            },
          );
        }
        const io = getIo();
        if (io) io.emit("enterpriseValidated", { id: enterprise.id, isValidate: true });
      }
    }
    // Gestion du logo
    const rawNewLogo = req.files?.logo?.[0]?.path || null;
    const logo = rawNewLogo ? await files.toWebP(rawNewLogo) : null;
    if (logo) {
      if (enterprise.logo) files.deleteFile(enterprise.logo);
      enterprise.logo = logo;
    } else if (removeLogo === "true" && enterprise.logo) {
      files.deleteFile(enterprise.logo);
      enterprise.logo = null;
    }
    // Gestion des nouvelles photos
    const rawNewPhotos = req.files?.photos?.map((f) => f.path) || [];
    const newPhotos = await Promise.all(rawNewPhotos.map((p) => files.toWebP(p)));
    if (newPhotos.length > 0) {
      if (enterprise.photos) {
        const maxPhotos = 3;
        const currentPhotos = enterprise.photos.length;
        if (currentPhotos + newPhotos.length > maxPhotos) {
          const photosToDeleteCount =
            currentPhotos + newPhotos.length - maxPhotos;
          const photosToDelete = enterprise.photos.slice(
            0,
            photosToDeleteCount,
          );
          photosToDelete.forEach((photo) => {
            files.deleteFile(photo);
          });
          enterprise.photos = enterprise.photos.slice(photosToDeleteCount);
        }
      }
      enterprise.photos = [...enterprise.photos, ...newPhotos];
    }
    if (removePhotos) {
      const photosToRemove = removePhotos.split(",").map(Number);
      const photosToDelete = photosToRemove.map(
        (index) => enterprise.photos[index],
      );
      enterprise.photos = enterprise.photos.filter(
        (photo, index) => !photosToRemove.includes(index),
      );
      photosToDelete.forEach((photo) => {
        if (photo) {
          files.deleteFile(photo);
        }
      });
    }
    const enterpriseData = {
      id: enterprise.id,
      slug: enterprise.slug,
      name: enterprise.name,
      isValidate: enterprise.isValidate,
    };
    if (enterprise.logo) {
      enterpriseData.logo = files.getUrl(
        req,
        "enterprises/logo",
        enterprise.logo,
      );
    }
    await enterprise.save();
    res
      .status(200)
      .json({ enterprise: enterpriseData, message: "Entreprise modifiée" });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.deleteEnterprise = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    if (!enterprise) {
      return res.status(404).json({ errors: "Pas de enterprises trouvée" });
    }
    if (enterprise.logo) {
      files.deleteFile(enterprise.logo);
    }
    if (enterprise.photos) {
      enterprise.photos.forEach((photo) => {
        files.deleteFile(photo);
      });
    }
    const user = await User.findByPk(enterprise.User_id);
    const userEnterprises = await user.getEnterprises();
    if (userEnterprises.length === 1) {
      user.isEntrepreneur = false;
      await user.save();
    }
    await enterprise.destroy();
    const io = getIo();
    if (io) {
      io.emit("enterpriseDeleted", { enterprises: enterprise.id });
    } else {
      console.log("io not defined");
    }
    res.status(200).json({ message: "enterprises supprimée" });
  } catch (error) {
    res.status(500).json({ errors: error.errors });
  }
};

exports.getPaymentInfo = async (req, res) => {
  try {
    const { iban, bic, payment_reference, bic_swift } = req.enterprise;
    return res.status(200).json({ iban, bic, payment_reference, bic_swift });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};

exports.updatePaymentInfo = async (req, res) => {
  try {
    const { iban, bic, payment_reference, bic_swift } = req.body;
    const enterprise = req.enterprise;
    enterprise.iban              = iban              ?? enterprise.iban;
    enterprise.bic               = bic               ?? enterprise.bic;
    enterprise.payment_reference = payment_reference ?? enterprise.payment_reference;
    enterprise.bic_swift         = bic_swift         ?? enterprise.bic_swift;
    await enterprise.save();
    return res.status(200).json({ message: "Informations de paiement mises à jour.", iban: enterprise.iban, bic: enterprise.bic, payment_reference: enterprise.payment_reference, bic_swift: enterprise.bic_swift });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur." });
  }
};
