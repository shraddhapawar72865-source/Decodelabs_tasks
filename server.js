const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const STORE_PATH = path.join(__dirname, "data", "store.json");

const menu = [
  { id: "double-cheese-burger", name: "Double Cheese Burger", price: 249, category: "burger", rating: 4.8, prepTime: "25-30 min", image: "double_cheese_burger.jpg", description: "Juicy patty, fresh vegetables and melted cheese.", badge: "Best Seller" },
  { id: "italian-cheese-pizza", name: "Italian Cheese Pizza", price: 399, category: "pizza", rating: 4.7, prepTime: "30-35 min", image: "cheese_pizza.jpg", description: "Wood-fired crust with mozzarella and fresh basil.", badge: "Chef's Choice" },
  { id: "masala-pasta", name: "Masala Pasta", price: 299, category: "indian", rating: 4.6, prepTime: "20-25 min", image: "maasala_pasra.webp", description: "Creamy pasta tossed with a rich masala sauce.", badge: "New" },
  { id: "mumbai-veg-burger", name: "Mumbai Veg Burger", price: 189, category: "burger", rating: 4.5, prepTime: "20-25 min", image: "mumbai_veg_burger.png", description: "Spiced vegetable patty with crisp fresh toppings." },
  { id: "veg-fried-rice", name: "Veg Fried Rice", price: 219, category: "asian", rating: 4.6, prepTime: "25-30 min", image: "veg_friied_rice.jpg", description: "Wok-tossed rice with colourful seasonal vegetables." },
  { id: "veg-manchurian", name: "Veg Manchurian", price: 229, category: "asian", rating: 4.7, prepTime: "25-30 min", image: "veg_manchurian.jpg", description: "Crisp vegetable dumplings in a tangy sauce." }
];

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch (error) {
    return { orders: [], messages: [] };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`);
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maxLength) : "";
}

function validationError(message, details) {
  const error = new Error(message);
  error.status = 400;
  error.details = details;
  return error;
}

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

app.get("/api/menu", (req, res) => {
  const category = cleanText(req.query.category, 20).toLowerCase();
  const search = cleanText(req.query.search, 60).toLowerCase();
  const items = menu.filter((item) => {
    const matchesCategory = !category || category === "all" || item.category === category;
    const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    return matchesCategory && (!search || haystack.includes(search));
  });
  res.json({ success: true, count: items.length, data: items, requestId: req.requestId });
});

app.get("/api/menu/:id", (req, res, next) => {
  const item = menu.find((entry) => entry.id === req.params.id);
  if (!item) return next(Object.assign(new Error("Menu item not found."), { status: 404 }));
  res.json({ success: true, data: item, requestId: req.requestId });
});

app.post("/api/orders", (req, res, next) => {
  const customerName = cleanText(req.body.customerName, 80);
  const customerEmail = cleanText(req.body.customerEmail, 120).toLowerCase();
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const errors = [];
  if (customerName.length < 2) errors.push("customerName must contain at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.push("customerEmail must be a valid email address.");
  if (!items.length) errors.push("items must contain at least one menu item.");
  if (errors.length) return next(validationError("Please correct the order details.", errors));

  const orderItems = [];
  for (const item of items) {
    const product = menu.find((entry) => entry.id === item.id);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return next(validationError("Each order item must use a valid menu id and a quantity from 1 to 10."));
    }
    orderItems.push({ id: product.id, name: product.name, price: product.price, quantity, subtotal: product.price * quantity });
  }

  const store = readStore();
  const order = { id: `TB-${Date.now().toString(36).toUpperCase()}`, customerName, customerEmail, items: orderItems, total: orderItems.reduce((sum, item) => sum + item.subtotal, 0), status: "confirmed", createdAt: new Date().toISOString() };
  store.orders.unshift(order);
  writeStore(store);
  res.status(201).json({ success: true, message: "Order confirmed. Your kitchen has been notified.", data: order, requestId: req.requestId });
});

app.get("/api/orders/:id", (req, res, next) => {
  const order = readStore().orders.find((entry) => entry.id === req.params.id);
  if (!order) return next(Object.assign(new Error("Order not found."), { status: 404 }));
  res.json({ success: true, data: order, requestId: req.requestId });
});

app.post("/api/messages", (req, res, next) => {
  const name = cleanText(req.body.name, 80);
  const email = cleanText(req.body.email, 120).toLowerCase();
  const message = cleanText(req.body.message, 800);
  const errors = [];
  if (name.length < 2) errors.push("name must contain at least 2 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email must be a valid email address.");
  if (message.length < 10) errors.push("message must contain at least 10 characters.");
  if (errors.length) return next(validationError("Please correct the message details.", errors));

  const store = readStore();
  store.messages.unshift({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
  writeStore(store);
  res.status(201).json({ success: true, message: "Thanks. Your message has been received.", requestId: req.requestId });
});

app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.use((req, res, next) => next(Object.assign(new Error("Route not found."), { status: 404 })));
app.use((error, req, res, next) => {
  const status = error.status || (error.type === "entity.parse.failed" ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, error: { message: status === 500 ? "Something went wrong on the server." : error.message, details: error.details }, requestId: req.requestId });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`TastyBite API is running at http://localhost:${PORT}`));
}

module.exports = app;
