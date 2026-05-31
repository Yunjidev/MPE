const multer = require("multer");
const path = require("path");
const fs = require("fs");

let sharp;
try { sharp = require("sharp"); } catch { sharp = null; }

const SAFE_FIELDNAME = /^[a-zA-Z0-9_-]+$/;

// banner et photos vont dans le même sous-dossier pour que getUrl("enterprises/photos") fonctionne
const FIELDNAME_SUBFOLDER = { banner: "photos" };

// Stockage temporaire — la conversion WebP se fait après réception
const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = path.join(__dirname, `../../uploads/${folder}`);
      const subfolder = FIELDNAME_SUBFOLDER[file.fieldname] ?? file.fieldname;
      if (subfolder && SAFE_FIELDNAME.test(subfolder)) {
        uploadPath = path.join(uploadPath, subfolder);
      }
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const name = file.originalname.split(" ").join("_");
      cb(null, `${Date.now()}-${name}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Format non supporté"));
};

const upload = (folder) =>
  multer({ storage: storage(folder), fileFilter, limits: { fileSize: 1024 * 1024 * 5 } });

// Convertit le fichier uploadé en WebP (max 1400px, qualité 80) si sharp est disponible.
// Retourne le chemin du fichier final.
async function toWebP(filePath) {
  if (!sharp) return filePath;
  if (filePath.endsWith(".webp")) return filePath;
  const outPath = filePath.replace(/\.[^.]+$/, ".webp");
  try {
    await sharp(filePath)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);
    fs.unlink(filePath, () => {});
    return outPath;
  } catch {
    return filePath;
  }
}

const deleteFile = (filePath) => {
  fs.stat(filePath, (err) => {
    if (!err) fs.unlink(filePath, () => {});
  });
};

const getUrl = (req, folder, file) =>
  `${req.protocol}://${req.get("host")}/app/uploads/${folder}/${path.basename(file)}`;

module.exports = { upload, deleteFile, getUrl, toWebP };
