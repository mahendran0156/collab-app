import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// ── GET /api/users — explore all creators (public) ───────────────────────────
router.get('/', async (req, res) => {
  try {
    const { field, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (field && field !== 'all') filter.field = field;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// ── GET /api/users/profile — get own profile ──────────────────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('projectsOwned', 'title status category createdAt collaborators likes')
      .populate('projectsJoined', 'title status category createdAt owner');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
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

    // If username is being changed, check it's not taken
    if (updates.username) {
      const taken = await User.findOne({
        username: updates.username,
        _id: { $ne: req.userId },
      });
      if (taken) return res.status(409).json({ error: 'Username is already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── GET /api/users/:id — public user profile ─────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projectsOwned', 'title status category createdAt collaborators likes');

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get stats
    const totalCollaborations = user.projectsJoined?.length || 0;
    const totalProjects = user.projectsOwned?.length || 0;

    res.json({ user, stats: { totalProjects, totalCollaborations } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
