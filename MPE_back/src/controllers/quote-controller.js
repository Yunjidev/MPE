"use strict";

const { sequelize } = require("../../models/index");
const Quote = sequelize.models.Quote;
const Enterprise = sequelize.models.Enterprise;
const sendEmail = require("../mailers/email-service");
const moment = require("moment-timezone");

const ensurePremiumEnterprise = (enterprise) => {
  if (!enterprise || !enterprise.isPremium) {
    const error = new Error("Cette entreprise n'est pas premium. Accès refusé.");
    error.statusCode = 403;
    throw error;
  }
};

function computeTotals(items = [], laborPrice = 0, laborPriceType = null, travelExpenses = 0, tvaRate = 20) {
  const itemsHT = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const up  = parseFloat(item.unit_price) || 0;
    return sum + qty * up;
  }, 0);

  const laborHT = laborPriceType ? (parseFloat(laborPrice) || 0) : 0;
  const travel  = parseFloat(travelExpenses) || 0;
  const total_ht  = parseFloat((itemsHT + laborHT + travel).toFixed(2));
  const rate      = parseFloat(tvaRate) || 0;
  const total_tva = parseFloat((total_ht * rate / 100).toFixed(2));
  const total_ttc = parseFloat((total_ht + total_tva).toFixed(2));
  return { total_ht, total_tva, total_ttc };
}

exports.listQuotes = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const quotes = await Quote.findAll({
      where: { Enterprise_id: enterprise.id },
      attributes: ["id", "quote_number", "status", "quote_date", "validity_days", "client_name", "client_company", "total_ttc", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(quotes);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur serveur." });
  }
};

exports.getQuote = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const quote = await Quote.findOne({
      where: { id: req.params.quoteId, Enterprise_id: enterprise.id },
    });
    if (!quote) return res.status(404).json({ error: "Devis introuvable." });
    return res.status(200).json(quote);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur serveur." });
  }
};

exports.createQuote = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const {
      quote_date, validity_days = 30,
      ent_name, ent_address, ent_city, ent_zip, ent_phone, ent_email,
      ent_siret, ent_tva_number, ent_legal_form, ent_legal_status, ent_rcs, ent_rm,
      client_name, client_company, client_address, client_city, client_zip, client_phone, client_email,
      work_start_date, work_duration,
      labor_description, labor_price_type, labor_price, travel_expenses,
      notes, items = [],
      payment_conditions, delivery_conditions, sav_conditions,
      is_free = true, tva_rate = 20,
    } = req.body;

    if (!client_name?.trim()) {
      return res.status(400).json({ error: "Le nom du client est obligatoire." });
    }

    const { total_ht, total_tva, total_ttc } = computeTotals(items, labor_price, labor_price_type, travel_expenses, tva_rate);

    const quote = await Quote.create({
      Enterprise_id: enterprise.id,
      status: "draft",
      quote_date: quote_date || moment().format("YYYY-MM-DD"),
      validity_days: parseInt(validity_days) || 30,
      ent_name:        ent_name        || enterprise.name,
      ent_address:     ent_address     || enterprise.adress,
      ent_city:        ent_city        || enterprise.city,
      ent_zip:         ent_zip         || enterprise.zip_code,
      ent_phone:       ent_phone       || enterprise.phone,
      ent_email:       ent_email       || enterprise.mail,
      ent_siret:       ent_siret       || enterprise.siret_number,
      ent_tva_number:   ent_tva_number  || null,
      ent_legal_form:   ent_legal_form  || null,
      ent_legal_status: ent_legal_status|| null,
      ent_rcs:          ent_rcs         || null,
      ent_rm:           ent_rm          || null,
      client_name: client_name.trim(),
      client_company:  client_company  || null,
      client_address:  client_address  || null,
      client_city:     client_city     || null,
      client_zip:      client_zip      || null,
      client_phone:    client_phone    || null,
      client_email:    client_email    || null,
      work_start_date: work_start_date || null,
      work_duration:   work_duration   || null,
      labor_description: labor_description || null,
      labor_price_type:  labor_price_type  || null,
      labor_price:       labor_price !== "" && labor_price != null ? parseFloat(labor_price) : null,
      travel_expenses:   travel_expenses !== "" && travel_expenses != null ? parseFloat(travel_expenses) : 0,
      notes:             notes || null,
      items,
      payment_conditions:  payment_conditions  || null,
      delivery_conditions: delivery_conditions || null,
      sav_conditions:      sav_conditions      || null,
      is_free: is_free === true || is_free === "true",
      tva_rate: parseFloat(tva_rate) || 20,
      total_ht, total_tva, total_ttc,
    });

    const year = new Date().getFullYear();
    const quoteNumber = `DEV-${year}-${String(quote.id).padStart(4, "0")}`;
    await quote.update({ quote_number: quoteNumber });

    return res.status(201).json({ message: "Devis créé.", quote: { ...quote.toJSON(), quote_number: quoteNumber } });
  } catch (error) {
    console.error(error);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur lors de la création du devis." });
  }
};

exports.updateQuote = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const quote = await Quote.findOne({
      where: { id: req.params.quoteId, Enterprise_id: enterprise.id },
    });
    if (!quote) return res.status(404).json({ error: "Devis introuvable." });
    if (quote.status === "sent" || quote.status === "accepted") {
      return res.status(400).json({ error: "Ce devis ne peut plus être modifié." });
    }

    const fields = req.body;
    const items         = fields.items !== undefined ? fields.items : quote.items;
    const labor_price   = fields.labor_price   !== undefined ? fields.labor_price   : quote.labor_price;
    const labor_price_type = fields.labor_price_type !== undefined ? fields.labor_price_type : quote.labor_price_type;
    const travel_expenses  = fields.travel_expenses  !== undefined ? fields.travel_expenses  : quote.travel_expenses;
    const tva_rate         = fields.tva_rate          !== undefined ? fields.tva_rate          : quote.tva_rate;

    const { total_ht, total_tva, total_ttc } = computeTotals(items, labor_price, labor_price_type, travel_expenses, tva_rate);

    await quote.update({ ...fields, items, total_ht, total_tva, total_ttc });
    return res.status(200).json({ message: "Devis mis à jour." });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur serveur." });
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const quote = await Quote.findOne({
      where: { id: req.params.quoteId, Enterprise_id: enterprise.id },
    });
    if (!quote) return res.status(404).json({ error: "Devis introuvable." });
    await quote.destroy();
    return res.status(200).json({ message: "Devis supprimé." });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur serveur." });
  }
};

exports.sendQuoteByEmail = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremiumEnterprise(enterprise);

    const quote = await Quote.findOne({
      where: { id: req.params.quoteId, Enterprise_id: enterprise.id },
    });
    if (!quote) return res.status(404).json({ error: "Devis introuvable." });

    const recipientEmail = req.body.email || quote.client_email;
    if (!recipientEmail) {
      return res.status(400).json({ error: "Adresse e-mail du client manquante." });
    }

    const validityDate = moment(quote.quote_date).add(quote.validity_days, "days").format("DD/MM/YYYY");
    const formatAmount = (v) => v != null ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";

    const itemsRows = (quote.items || []).map((item) => {
      const ht = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.description || ""}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 0}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(item.unit_price)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatAmount(ht)}</td>
        </tr>`;
    }).join("");

    await sendEmail(
      recipientEmail,
      `Devis ${quote.quote_number} — ${quote.ent_name || enterprise.name}`,
      "quote-email",
      {
        quote_number: quote.quote_number,
        quote_date: moment(quote.quote_date).format("DD/MM/YYYY"),
        validity_date: validityDate,
        ent_name: quote.ent_name || enterprise.name,
        ent_address: [quote.ent_address, quote.ent_zip, quote.ent_city].filter(Boolean).join(", "),
        ent_phone: quote.ent_phone || "",
        ent_email: quote.ent_email || "",
        ent_siret: quote.ent_siret || "",
        ent_tva_number: quote.ent_tva_number || "",
        ent_legal_form: quote.ent_legal_form || "",
        ent_rcs: quote.ent_rcs || "",
        ent_rm: quote.ent_rm || "",
        client_name: quote.client_name,
        client_company: quote.client_company || "",
        client_address: [quote.client_address, quote.client_zip, quote.client_city].filter(Boolean).join(", "),
        client_phone: quote.client_phone || "",
        client_email: quote.client_email || "",
        work_start_date: quote.work_start_date ? moment(quote.work_start_date).format("DD/MM/YYYY") : "",
        work_duration: quote.work_duration || "",
        items_rows: itemsRows,
        labor_description: quote.labor_description || "",
        labor_price_type: quote.labor_price_type === "hourly" ? "Taux horaire" : quote.labor_price_type === "fixed" ? "Forfait" : "",
        labor_price: quote.labor_price ? formatAmount(quote.labor_price) : "",
        travel_expenses: parseFloat(quote.travel_expenses) > 0 ? formatAmount(quote.travel_expenses) : "",
        tva_rate: `${quote.tva_rate} %`,
        total_ht: formatAmount(quote.total_ht),
        total_tva: formatAmount(quote.total_tva),
        total_ttc: formatAmount(quote.total_ttc),
        payment_conditions: quote.payment_conditions || "",
        is_free: quote.is_free ? "Devis gratuit" : "Devis payant",
        notes: quote.notes || "",
      }
    );

    await quote.update({ status: "sent" });
    return res.status(200).json({ message: "Devis envoyé par e-mail." });
  } catch (error) {
    console.error(error);
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.statusCode === 403 ? error.message : "Erreur lors de l'envoi du devis." });
  }
};
