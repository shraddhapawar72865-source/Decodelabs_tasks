const assert = require("node:assert/strict");
const test = require("node:test");
const app = require("./server");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("health endpoint reports a healthy service", async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "healthy");
  assert.ok(body.requestId);
});

test("menu endpoint returns menu items and supports filtering", async () => {
  const response = await fetch(`${baseUrl}/api/menu?category=burger`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.count, 2);
  assert.ok(body.data.every((item) => item.category === "burger"));
});

test("orders require valid customer and item details", async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerName: "A", customerEmail: "not-an-email", items: [] })
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, "Please correct the order details.");
});

test("messages require a valid name, email, and message", async () => {
  const response = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "A", email: "not-an-email", message: "Too short" })
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.message, "Please correct the message details.");
});
