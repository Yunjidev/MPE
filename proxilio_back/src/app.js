require("dotenv").config();
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const { initIo } = require("./io");
const app = express();
const db = require("../models/index");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
// Routes
const publicRoutes = require("./routes/public/public-routes");
const authenticatedRoutes = require("./routes/authenticated/authenticated-routes");
const adminRoutes = require("./routes/admin/admin-routes");
const stripeController = require("./controllers/stripe-controller");

app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

const corsOptions = {
  origin: allowedOrigins,
  exposedHeaders: ["Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Health check — avant tout middleware, toujours disponible
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Sitemap dynamique (hors préfixe /api pour que Nginx le route directement)
app.get("/sitemap.xml", require("./controllers/sitemap-controller").getSitemap);

// Webhook Stripe : raw body AVANT express.json() pour la vérification de signature
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, charset: "utf-8" }));

app.use((req, res, next) => {
  res.charset = "UTF-8";
  next();
});

const server = http.createServer(app);
initIo(server);

db.sequelize
  .authenticate()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Error:" + error));

const uploadDir = path.resolve(__dirname, "../uploads");
app.use("/app/uploads", express.static(uploadDir));

app.use("/api", publicRoutes);
app.use("/api", authenticatedRoutes);
app.use("/api", adminRoutes);
app.use("/api/stripe", require("./routes/stripe-routes"));
app.use((err, req, res, next) => {
  console.error("❌ ERREUR SERVER :", err);
  const isProd = process.env.NODE_ENV === "production";
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ errors: "Trop de fichiers envoyés ou champ non autorisé." });
  }
  if (err.code && err.code.startsWith("LIMIT_")) {
    return res.status(400).json({ errors: err.message });
  }
  res.status(500).json({ errors: isProd ? "Erreur serveur" : err.message });
});

require("./scheduler");