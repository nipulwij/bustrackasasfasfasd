import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Simple in-memory store
const users = new Map(); // key: email, value: user object

// Serve static files (frontend)
app.use(express.static(__dirname));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function basicPasswordOk(password) {
  return typeof password === 'string' && password.length >= 8;
}

app.post('/api/signup', async (req, res) => {
  try {
    const { role, fullName, email, password, licenseNumber, vehicleNumber, contactNumber, address } = req.body || {};

    if (!role || !['passenger', 'driver'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (!fullName || !isValidEmail(email) || !basicPasswordOk(password)) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    if (users.has(email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    if (role === 'driver') {
      if (!licenseNumber || !vehicleNumber || !contactNumber || !address) {
        return res.status(400).json({ message: 'Missing driver details' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: uuidv4(),
      role,
      fullName,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      driver: role === 'driver' ? { licenseNumber, vehicleNumber, contactNumber, address } : null,
    };
    users.set(email, user);
    return res.status(201).json({ id: user.id, role: user.role, email: user.email, fullName: user.fullName });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { role, email, password } = req.body || {};
    if (!role || !['passenger', 'driver'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (!isValidEmail(email) || !basicPasswordOk(password)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const user = users.get(email);
    if (!user || user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    return res.json({ id: user.id, role: user.role, email: user.email, fullName: user.fullName });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


