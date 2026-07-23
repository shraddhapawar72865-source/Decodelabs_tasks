const assert = require("node:assert/strict");
const test = require("node:test");
const app = require("./server");
const Menu = require("./models/Menu");
const Order = require("./models/Order");
const Contact = require("./models/Contact");

test("health endpoint responds without a database connection", async () => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.success, true);
    assert.equal(body.data.service, "TastyBite API");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("Mongoose schemas expose the required Project 3 fields", () => {
  assert.ok(Menu.schema.path("slug"));
  assert.ok(Order.schema.path("items"));
  assert.ok(Order.schema.path("total"));
  assert.ok(Contact.schema.path("message"));
});

test("contact schema rejects invalid user input before database storage", async () => {
  const invalidContact = new Contact({ name: "A", email: "not-an-email", message: "Short" });
  await assert.rejects(invalidContact.validate(), (validation) => {
    assert.ok(validation.errors.name);
    assert.ok(validation.errors.email);
    assert.ok(validation.errors.message);
    return true;
  });
});
