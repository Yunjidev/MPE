"use strict";

const { sequelize } = require("../../models/index");
const Invoice = sequelize.models.Invoice;
const Quote   = sequelize.models.Quote;
const Enterprise = sequelize.models.Enterprise;
const sendEmail = require("../mailers/email-service");
const buildPdf  = require("../utils/generateInvoicePdf");
const moment = require("moment-timezone");
const path   = require("path");

const ensurePremium = (enterprise) => {
  if (!enterprise || !enterprise.isPremium) {
    const err = new Error("Cette entreprise n'est pas premium.");
    err.statusCode = 403;
    throw err;
  }
};

function sanitize(val) { return val !== "" && val != null ? val : null; }
function sanitizeNum(val) { return val !== "" && val != null ? parseFloat(val) : null; }

function computeTotals(items = [], laborPrice, laborPriceType, travel, tvaRate) {
  const itemsHT = items.reduce((s, it) => s + (parseFloat(it.quantity)||0) * (parseFloat(it.unit_price)||0), 0);
  const laborHT = laborPriceType ? (parseFloat(laborPrice)||0) : 0;
  const travelHT = parseFloat(travel)||0;
  const ht  = +(itemsHT + laborHT + travelHT).toFixed(2);
  const tva = +(ht * (parseFloat(tvaRate)||0) / 100).toFixed(2);
  return { total_ht: ht, total_tva: tva, total_ttc: +(ht + tva).toFixed(2) };
}

function buildPayload(body, enterprise) {
  const {
    invoice_date, due_date,
    ent_name, ent_address, ent_city, ent_zip, ent_phone, ent_email,
    ent_siret, ent_tva_number, ent_legal_form, ent_legal_status, ent_rcs, ent_rm,
    client_name, client_company, client_address, client_city, client_zip, client_phone, client_email,
    items = [], labor_description, labor_price_type, labor_price, travel_expenses,
    payment_conditions, payment_method, payment_days, iban, bic, payment_reference, bic_swift, notes, tva_rate = 20,
    Quote_id, Reservation_id,
  } = body;

  const { total_ht, total_tva, total_ttc } = computeTotals(items, labor_price, labor_price_type, travel_expenses, tva_rate);

  return {
    Enterprise_id: enterprise.id,
    Quote_id:       sanitize(Quote_id),
    Reservation_id: sanitize(Reservation_id),
    invoice_date:   invoice_date || moment().format("YYYY-MM-DD"),
    due_date:       sanitize(due_date),
    ent_name:        ent_name        || enterprise.name,
    ent_address:     ent_address     || enterprise.adress,
    ent_city:        ent_city        || enterprise.city,
    ent_zip:         ent_zip         || enterprise.zip_code,
    ent_phone:       ent_phone       || enterprise.phone,
    ent_email:       ent_email       || enterprise.mail,
    ent_siret:       ent_siret       || enterprise.siret_number,
    ent_tva_number:  sanitize(ent_tva_number),
    ent_legal_form:  sanitize(ent_legal_form),
    ent_legal_status:sanitize(ent_legal_status),
    ent_rcs:         sanitize(ent_rcs),
    ent_rm:          sanitize(ent_rm),
    client_name:    (client_name || "").trim(),
    client_company: sanitize(client_company),
    client_address: sanitize(client_address),
    client_city:    sanitize(client_city),
    client_zip:     sanitize(client_zip),
    client_phone:   sanitize(client_phone),
    client_email:   sanitize(client_email),
    items,
    labor_description: sanitize(labor_description),
    labor_price_type:  sanitize(labor_price_type),
    labor_price:       sanitizeNum(labor_price),
    travel_expenses:   sanitizeNum(travel_expenses) || 0,
    payment_conditions: sanitize(payment_conditions),
    payment_method:     sanitize(payment_method),
    payment_days:       payment_days != null ? parseInt(payment_days) : 30,
    iban:               sanitize(iban)              || enterprise.iban              || null,
    bic:                sanitize(bic)               || enterprise.bic               || null,
    payment_reference:  sanitize(payment_reference) || enterprise.payment_reference || null,
    bic_swift:          sanitize(bic_swift)          || enterprise.bic_swift          || null,
    notes:              sanitize(notes),
    tva_rate: parseFloat(tva_rate) || 20,
    total_ht, total_tva, total_ttc,
  };
}

exports.listInvoices = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const invoices = await Invoice.findAll({
      where: { Enterprise_id: enterprise.id },
      attributes: ["id", "invoice_number", "status", "invoice_date", "due_date", "client_name", "client_company", "total_ttc", "Quote_id", "Reservation_id"],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json(invoices);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Erreur serveur." });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const invoice = await Invoice.findOne({ where: { id: req.params.invoiceId, Enterprise_id: enterprise.id } });
    if (!invoice) return res.status(404).json({ error: "Facture introuvable." });
    return res.status(200).json(invoice);
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || "Erreur serveur." });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    if (!req.body.client_name?.trim()) return res.status(400).json({ error: "Le nom du client est obligatoire." });

    const payload = buildPayload(req.body, enterprise);
    const invoice = await Invoice.create({ ...payload, status: "draft" });
    const year = new Date().getFullYear();
    const invoiceNumber = `FACT-${year}-${String(invoice.id).padStart(4, "0")}`;
    await invoice.update({ invoice_number: invoiceNumber });
    return res.status(201).json({ message: "Facture créée.", invoice: { ...invoice.toJSON(), invoice_number: invoiceNumber } });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.statusCode === 403 ? error.message : "Erreur lors de la création." });
  }
};

exports.createFromQuote = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const quote = await Quote.findOne({ where: { id: req.params.quoteId, Enterprise_id: enterprise.id } });
    if (!quote) return res.status(404).json({ error: "Devis introuvable." });

    const invoice = await Invoice.create({
      Enterprise_id: enterprise.id,
      Quote_id:      quote.id,
      status:        "draft",
      invoice_date:  moment().format("YYYY-MM-DD"),
      due_date:      moment().add(30, "days").format("YYYY-MM-DD"),
      ent_name: quote.ent_name, ent_address: quote.ent_address, ent_city: quote.ent_city,
      ent_zip: quote.ent_zip, ent_phone: quote.ent_phone, ent_email: quote.ent_email,
      ent_siret: quote.ent_siret, ent_tva_number: quote.ent_tva_number,
      ent_legal_form: quote.ent_legal_form, ent_legal_status: quote.ent_legal_status,
      ent_rcs: quote.ent_rcs, ent_rm: quote.ent_rm,
      client_name: quote.client_name, client_company: quote.client_company,
      client_address: quote.client_address, client_city: quote.client_city,
      client_zip: quote.client_zip, client_phone: quote.client_phone, client_email: quote.client_email,
      items: quote.items, labor_description: quote.labor_description,
      labor_price_type: quote.labor_price_type, labor_price: quote.labor_price,
      travel_expenses: quote.travel_expenses,
      payment_conditions: quote.payment_conditions, notes: quote.notes,
      tva_rate: quote.tva_rate,
      total_ht: quote.total_ht, total_tva: quote.total_tva, total_ttc: quote.total_ttc,
    });
    const year = new Date().getFullYear();
    const invoiceNumber = `FACT-${year}-${String(invoice.id).padStart(4, "0")}`;
    await invoice.update({ invoice_number: invoiceNumber });
    return res.status(201).json({ message: "Facture créée depuis le devis.", invoice: { ...invoice.toJSON(), invoice_number: invoiceNumber } });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: "Erreur lors de la création de la facture." });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const invoice = await Invoice.findOne({ where: { id: req.params.invoiceId, Enterprise_id: enterprise.id } });
    if (!invoice) return res.status(404).json({ error: "Facture introuvable." });

    const fields = req.body;
    const items        = fields.items            !== undefined ? fields.items            : invoice.items;
    const laborPrice   = fields.labor_price      !== undefined ? fields.labor_price      : invoice.labor_price;
    const laborType    = fields.labor_price_type !== undefined ? fields.labor_price_type : invoice.labor_price_type;
    const travel       = fields.travel_expenses  !== undefined ? fields.travel_expenses  : invoice.travel_expenses;
    const tvaRate      = fields.tva_rate         !== undefined ? fields.tva_rate         : invoice.tva_rate;
    const { total_ht, total_tva, total_ttc } = computeTotals(items, laborPrice, laborType, travel, tvaRate);

    const sanitizedType = (fields.labor_price_type !== undefined)
      ? (fields.labor_price_type || null)
      : invoice.labor_price_type;

    await invoice.update({ ...fields, items, labor_price_type: sanitizedType, total_ht, total_tva, total_ttc });
    return res.status(200).json({ message: "Facture mise à jour." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: "Erreur serveur." });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const invoice = await Invoice.findOne({ where: { id: req.params.invoiceId, Enterprise_id: enterprise.id } });
    if (!invoice) return res.status(404).json({ error: "Facture introuvable." });
    await invoice.destroy();
    return res.status(200).json({ message: "Facture supprimée." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: "Erreur serveur." });
  }
};

exports.sendInvoiceByEmail = async (req, res) => {
  try {
    const enterprise = req.enterprise;
    ensurePremium(enterprise);
    const invoice = await Invoice.findOne({ where: { id: req.params.invoiceId, Enterprise_id: enterprise.id } });
    if (!invoice) return res.status(404).json({ error: "Facture introuvable." });

    const recipientEmail = req.body.email || invoice.client_email;
    if (!recipientEmail) return res.status(400).json({ error: "Adresse e-mail du client manquante." });

    const logoPath = enterprise.logo
      ? path.join(__dirname, "../../uploads/enterprises/logo", path.basename(enterprise.logo))
      : null;

    const invoiceForPdf = {
      ...invoice.toJSON(),
      iban:              invoice.iban              || enterprise.iban,
      bic:               invoice.bic               || enterprise.bic,
      payment_reference: invoice.payment_reference || enterprise.payment_reference,
      bic_swift:         invoice.bic_swift          || enterprise.bic_swift,
    };
    const pdfBuffer = await buildPdf(invoiceForPdf, logoPath);
    const formatAmount = (v) => v != null ? `${parseFloat(v).toFixed(2).replace(".", ",")} €` : "—";
    const dueDate = invoice.due_date ? moment(invoice.due_date).format("DD/MM/YYYY") : "—";

    await sendEmail(
      recipientEmail,
      `Facture ${invoice.invoice_number} — ${invoice.ent_name || enterprise.name}`,
      "invoice-notification",
      {
        invoice_number: invoice.invoice_number,
        invoice_date:   moment(invoice.invoice_date).format("DD/MM/YYYY"),
        due_date:       dueDate,
        ent_name:       invoice.ent_name || enterprise.name,
        ent_email:      invoice.ent_email || enterprise.mail,
        client_name:    invoice.client_name,
        total_ttc:      formatAmount(invoice.total_ttc),
      },
      [{ filename: `facture-${invoice.invoice_number}.pdf`, content: pdfBuffer, contentType: "application/pdf" }]
    );

    await invoice.update({ status: "sent" });
    return res.status(200).json({ message: "Facture envoyée par e-mail." });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: "Erreur lors de l'envoi." });
  }
};
