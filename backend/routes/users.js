import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import protect from '../middleware/protect.js';

const router = express.Router();

// ── GET /api/users — explore all creators ─────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { field, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (field && field !== 'all') filter.field = field;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio:      { $regex: search, $options: 'i' } },
        { skills:   { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    console.error('GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// ── GET /api/users/profile — get own profile (NO populate) ────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    // Simple select — no populate to avoid crashes on empty arrays
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('GET /users/profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── PUT /api/users/profile — update own profile ───────────────────────────────
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['username', 'bio', 'field', 'skills', 'avatar', 'portfolio', 'github', 'website'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    if (updates.username) {
      const taken = await User.findOne({ username: updates.username, _id: { $ne: req.userId } });
      if (taken) return res.status(409).json({ error: 'Username is already taken' });
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('PUT /users/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── GET /api/users/:id — public user profile ──────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user, stats: { totalProjects: 0, totalCollaborations: 0 } });
  } catch (err) {
    console.error('GET /users/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;