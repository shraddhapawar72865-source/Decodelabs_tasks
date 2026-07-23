require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const path = require("path");
const connectDatabase = require("./config/db");
const Menu = require("./models/Menu");
const defaultMenu = require("./data/defaultMenu");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { service: "TastyBite API", status: "healthy", timestamp: new Date().toISOString() }, requestId: req.requestId });
});

// Existing frontend endpoints stay unchanged; their implementation is MongoDB-backed.
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", contactRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(express.static(__dirname, { dotfiles: "deny" }));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use(notFound);
app.use(errorHandler);

async function seedDefaultMenu() {
  if (await Menu.estimatedDocumentCount()) return;
  await Menu.insertMany(defaultMenu);
  console.log("Initial TastyBite menu seeded into MongoDB.");
}

async function startServer() {
  await connectDatabase();
  await seedDefaultMenu();
  app.listen(PORT, () => console.log(`TastyBite API is running at http://localhost:${PORT}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Unable to start TastyBite API: ${error.message}`);
    process.exit(1);
  });
}

module.exports = app;
