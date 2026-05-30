#!/usr/bin/env node
/**
 * Import des fiches professionnelles publiques depuis le CSV annuaire_monpresta.csv
 * Usage : node scripts/import-listings.js
 */
"use strict";

const path   = require("path");
const fs     = require("fs");
const crypto = require("crypto");

// Charger les modèles Sequelize
process.chdir(path.join(__dirname, ".."));
const { sequelize } = require("../models/index");
const Enterprise = sequelize.models.Enterprise;
const Job        = sequelize.models.Job;
const Country    = sequelize.models.Country;

/* ─────────────────────────────────────────────────────
   Mapping manuel : intitulé CSV → job DB le plus proche
   null = créer un nouveau job avec ce nom
   ───────────────────────────────────────────────────── */
const JOB_MAP = {
  // Métiers existants (id DB)
  "Ostéopathe":                                           "Ostéopathe",
  "Osteopathe":                                           "Ostéopathe",
  "Naturopathe":                                          "Naturopathe",
  "Naturopathie":                                         "Naturopathe",
  "Sophrologue":                                          "Sophrologue",
  "Serrurier":                                            "Serrurier",
  "Maçon":                                                "Maçon",
  "Coiffure":                                             "Coiffeur à domicile",
  "Photographe":                                          "Photographe",
  "Photographe et Biographe":                             "Photographe",
  "Jardinier paysagiste":                                 "Jardinier paysagiste",
  "Paysagiste":                                           "Jardinier paysagiste",
  "Hypnotiseur":                                          "Hypnotiseur",
  "Hypnose":                                              "Hypnotiseur",
  "Hypnothérapeute":                                      "Hypnotiseur",
  "Service d'hypnothérapie":                              "Hypnotiseur",
  "Psychologue":                                          "Psychologue",
  "Psychothérapeute":                                     "Psychologue",
  "Psychopraticien":                                      "Psychologue",
  "Psychanalyste":                                        "Psychologue",
  "Service de santé mentale":                             "Psychologue",
  "Diététicien":                                          "Diététicien",
  "Diététicienne-nutritionniste":                         "Diététicien",
  "Graphiste":                                            "Graphiste",
  "Web et graphic designer":                              "Graphiste",
  "Designer graphique éco-responsable":                   "Graphiste",
  "Développeur web":                                      "Développeur web",
  "Créateur de sites web impactants et performants avec Webflow": "Développeur web",
  "Créateur de sites web, développeur, hébergeur":        "Développeur web",
  "Dépanneur informatique":                               "Dépanneur informatique",
  "Réparateur informatique":                              "Dépanneur informatique",
  "Dépannage informatique Conseils, services, maintenance en informatique Vente de matériel, de consommables d'informatique": "Dépanneur informatique",
  "Technicien informatique":                              "Dépanneur informatique",
  "Peintre en bâtiment":                                  "Peintre en bâtiment",
  "Peintre plaquiste":                                    "Peintre en bâtiment",
  "Artisan peintre":                                      "Peintre en bâtiment",
  "Chauffeur VTC":                                        "Chauffeur VTC",
  "Chauffeur privé":                                      "Chauffeur VTC",
  "Chauffeur autocar indépendant":                        "Chauffeur VTC",
  "Transporteur de marchandises":                         "Transporteur de marchandises",
  "Société de transport routier":                         "Transporteur de marchandises",
  "Plombier":                                             "Plombier",
  "Plombier Chauffagiste":                                "Plombier",
  "Consultant en référencement":                          "Consultant en référencement",
  "Expert Shopify & SEO":                                 "Consultant en référencement",
  "Consultant RH":                                        "Consultant RH",
  "Consultante RH":                                       "Consultant RH",
  "Secrétaire à domicile":                                "Secrétaire à domicile",
  "Secrétaire administrative":                            "Secrétaire à domicile",
  "Secrétaire administrative indépendante":               "Secrétaire à domicile",
  "Assistante indépendante en conseil relation publique pour association, micro entreprise, artisan": "Secrétaire à domicile",
  "Assistante virtuelle & digitale":                      "Secrétaire à domicile",
  "Masseur bien-être":                                    "Masseur bien-être",
  "Institut de massages":                                 "Masseur bien-être",
  "Artisan d'art":                                        "Artisan d'art",
  "Créatrice":                                            "Artisan d'art",
  "Fabrication de vestes uniques":                        "Artisan d'art",
  "Professeur à domicile":                                "Professeur à domicile",
  "Professeur de français":                               "Professeur à domicile",
  "Professeur de danse":                                  "Professeur de danse",
  "Professeur de musique et de danse":                    "Professeur de danse",
  "Décorateur d'intérieur":                               "Décorateur d'intérieur",
  "Décoration":                                           "Décorateur d'intérieur",
  "Architecte":                                           "Architecte",
  "Architecte d'intérieur":                               "Architecte",
  "Formateur":                                            "Formateur",
  "École hôtelière":                                      "Formateur",
  "Community Manager":                                    "Community Manager",
  "Agence marketing web":                                 "Community Manager",
  "Coach sportif":                                        "Coach sportif",
  "Coach particulier":                                    "Coach sportif",
  "Sophrologue, reflexologue, ambassadrice Marcus Spurway": "Sophrologue",
  // Nouveaux métiers à créer
  "Métallier":                                            "Métallier",
  "Entrepreneur spécialisé dans les systèmes de CVC":     "Technicien CVC",
  "Entreprise de terrassement":                           "Terrassier",
  "Coach de vie":                                         "Coach de vie",
  "Déménageur":                                           "Déménageur",
  "Courtier en prêts hypothécaires":                      "Courtier en prêts immobiliers",
  "Courtier d'assurances":                                "Courtier en assurances",
  "Réflexologue":                                         "Réflexologue",
  "Praticien de médecine alternative":                    "Praticien en médecine douce",
  "Praticien en médecine holistique":                     "Praticien en médecine douce",
  "Avocat":                                               "Avocat",
  "Charpentier":                                          "Charpentier",
  "Thérapeute Reiki":                                     "Thérapeute Reiki",
  "Praticien enseignant en Reiki":                        "Thérapeute Reiki",
  "Isabelle Gomes de Castro":                             "Thérapeute Reiki",
  "Art-thérapeute":                                       "Art-thérapeute",
  "Acupuncteur":                                          "Acupuncteur",
  "Création de logiciels d'astrologie, étude de thèmes, formations.": "Développeur web",
  "Cadre administrative":                                 "Secrétaire à domicile",
  "Kinésiologie":                                         "Kinésiologue",
  "Kinésiologue":                                         "Kinésiologue",
  "Maître d'œuvre":                                       "Maître d'œuvre",
  "Energéticien":                                         "Énergéticien",
  "Entreprise de nettoyage":                              "Entreprise de nettoyage",
  "Service de nettoyage et d'entretien":                  "Entreprise de nettoyage",
  "TRAITEMENT DES NUISIBLES, NETTOYAGE DÉSINFECTION":     "Traitement des nuisibles",
  "Traitement des punaises de lit":                       "Traitement des nuisibles",
  "COACHING FAMILIAL/PARENTAL":                           "Coach de vie",
  "Consultant en cybersécurité":                          "Consultant en cybersécurité",
  "Création d'accessoires de mode":                       "Artisan d'art",
};

/* Normalise une chaîne pour comparaison */
function norm(s) {
  return (s || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ").trim();
}

/* Génère un slug unique */
async function ensureUniqueSlug(name) {
  const base = norm(name).replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
  let slug = base, i = 1;
  while (await Enterprise.findOne({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/* Parse le CSV manuellement (pas de dépendance externe) */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let inQuotes = false, current = "";
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
    rows.push(row);
  }
  return rows;
}

/* Décode les caractères mal encodés (latin-1 → UTF-8 mangling) */
function fixEncoding(s) {
  try {
    return Buffer.from(s, "latin1").toString("utf8");
  } catch { return s; }
}

async function main() {
  await sequelize.authenticate();
  console.log("✅ DB connectée");

  // Lire le CSV (depuis le dossier scripts/ ou racine)
  const csvPath = path.join(__dirname, "../annuaire_monpresta.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("❌ Fichier CSV introuvable :", csvPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(csvPath, "latin1");
  // Ré-encoder en UTF-8 (le fichier est encodé latin-1)
  const text = Buffer.from(raw, "latin1").toString("utf8");
  const rows = parseCSV(text);
  console.log(`📋 ${rows.length} lignes dans le CSV`);

  // Charger les jobs existants
  const dbJobs = await Job.findAll();
  const jobByName = {};
  for (const j of dbJobs) jobByName[norm(j.name)] = j;

  // Obtenir ou créer un job
  async function getOrCreateJob(csvJobRaw) {
    const csvJob = csvJobRaw.trim();
    // Chercher dans le mapping manuel
    const mapped = JOB_MAP[csvJob] || JOB_MAP[fixEncoding(csvJob)];
    const targetName = mapped || csvJob;

    // Chercher en DB par nom normalisé
    const existing = jobByName[norm(targetName)];
    if (existing) return existing;

    // Créer le job
    console.log(`  ➕ Nouveau métier : "${targetName}"`);
    const newJob = await Job.create({ name: targetName });
    jobByName[norm(targetName)] = newJob;
    return newJob;
  }

  // Récupérer un pays par défaut (France)
  const france = await Country.findOne({ where: { name: "France" } })
    || await Country.findOne(); // fallback premier pays

  let created = 0, skipped = 0;

  for (const row of rows) {
    const name    = (row["Nom"]      || "").trim();
    const jobRaw  = (row["Métier"]   || row["MÃ©tier"] || "").trim();
    const city    = (row["Ville"]    || "").trim();
    const website = (row["Site web"] || "").trim();
    const phone   = (row["Téléphone"] || row["TÃ©lÃ©phone"] || "").trim();

    if (!name) { skipped++; continue; }

    // Vérifier si déjà importé (même nom exact)
    const exists = await Enterprise.findOne({ where: { name } });
    if (exists) { console.log(`  ⏭  Existe déjà : "${name}"`); skipped++; continue; }

    const job = jobRaw ? await getOrCreateJob(jobRaw) : null;

    const slug = await ensureUniqueSlug(name);

    await Enterprise.create({
      name,
      slug,
      city:      city    || "",
      adress:    "",
      zip_code:  "",
      mail:      "",
      website:   website || null,
      phone:     phone   || null,
      description: "",
      Job_id:    job?.id || null,
      Country_id: france?.id || null,
      isValidate:        true,
      isPremium:         false,
      is_claimed:        false,
      is_public_listing: true,
      User_id:           null,
    });

    console.log(`  ✅ Créé : "${name}" (${jobRaw || "sans métier"}, ${city})`);
    created++;
  }

  console.log(`\n📊 Import terminé : ${created} créées, ${skipped} ignorées`);
  await sequelize.close();
}

main().catch((err) => { console.error("❌", err); process.exit(1); });
