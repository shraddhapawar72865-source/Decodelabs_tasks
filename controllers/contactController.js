const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const asyncHandler = require("../middleware/asyncHandler");

function contactIdIsValid(id) { return mongoose.isValidObjectId(id); }

const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create(req.body);
  res.status(201).json({ success: true, message: "Thanks. Your message has been received.", data: contact, requestId: req.requestId });
});

const getContacts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1); const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [contacts, totalItems] = await Promise.all([Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), Contact.countDocuments(filter)]);
  res.json({ success: true, count: contacts.length, data: contacts, pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) }, requestId: req.requestId });
});

const getContact = asyncHandler(async (req, res) => {
  if (!contactIdIsValid(req.params.id)) throw Object.assign(new Error("The supplied resource id is invalid."), { statusCode: 400 });
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ success: false, error: { message: "Message not found." }, requestId: req.requestId });
  res.json({ success: true, data: contact, requestId: req.requestId });
});

const updateContact = asyncHandler(async (req, res) => {
  if (!contactIdIsValid(req.params.id)) throw Object.assign(new Error("The supplied resource id is invalid."), { statusCode: 400 });
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!contact) return res.status(404).json({ success: false, error: { message: "Message not found." }, requestId: req.requestId });
  res.json({ success: true, message: "Message updated.", data: contact, requestId: req.requestId });
});

const deleteContact = asyncHandler(async (req, res) => {
  if (!contactIdIsValid(req.params.id)) throw Object.assign(new Error("The supplied resource id is invalid."), { statusCode: 400 });
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ success: false, error: { message: "Message not found." }, requestId: req.requestId });
  res.status(204).send();
});

module.exports = { createContact, getContacts, getContact, updateContact, deleteContact };
