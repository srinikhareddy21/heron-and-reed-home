import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Address } from "../models/Address.js";
import { signToken } from "../utils/token.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function buildProfile(user) {
  const address = await Address.findOne({ user: user._id, isDefault: true }).lean();
  return user.toProfile(address ? new Address(address).toClient() : undefined);
}

export async function signup(req, res) {
  const { name, email, password } = req.body ?? {};

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Please enter your full name." });
  }
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(normalizedEmail)) {
    return res.status(400).json({ error: "Please enter a valid email." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Please sign in." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  const token = signToken(user._id);
  res.status(201).json({ token, user: await buildProfile(user) });
}

export async function login(req, res) {
  const { email, password } = req.body ?? {};
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ error: "No account found for that email. Please create one." });
  }

  const valid = await bcrypt.compare(password ?? "", user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password. Please try again." });
  }

  const token = signToken(user._id);
  res.json({ token, user: await buildProfile(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: await buildProfile(user) });
}

export async function updateProfile(req, res) {
  const { name, email } = req.body ?? {};
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  if (typeof name === "string" && name.trim().length >= 2) user.name = name.trim();
  if (typeof email === "string") {
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please enter a valid email." });
    }
    user.email = normalizedEmail;
  }

  await user.save();
  res.json({ user: await buildProfile(user) });
}

export async function saveAddress(req, res) {
  const { fullName, line1, line2, city, region, postal, country } = req.body ?? {};
  const required = { fullName, line1, city, region, postal, country };
  for (const [key, value] of Object.entries(required)) {
    if (!value || String(value).trim().length === 0) {
      return res.status(400).json({ error: `Missing required address field: ${key}` });
    }
  }

  const update = { fullName, line1, line2: line2 ?? "", city, region, postal, country, isDefault: true };
  const address = await Address.findOneAndUpdate(
    { user: req.userId, isDefault: true },
    { $set: { user: req.userId, ...update } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const user = await User.findById(req.userId);
  res.json({ user: user.toProfile(address.toClient()) });
}
