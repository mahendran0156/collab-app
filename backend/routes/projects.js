import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import protect from '../middleware/protect.js';

const router = express.Router();

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12, sortBy = 'createdAt' } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const sort = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const [projects, total] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(Number(limit))
        .populate('owner', 'username field avatar')
        .populate('collaborators', 'username field avatar'),
      Project.countDocuments(filter),
    ]);
    res.json({ projects, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) } });
  } catch (err) {
    console.error('GET /projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'username field avatar bio skills')
      .populate('collaborators', 'username field avatar bio skills')
      .populate('reviews.user', 'username avatar');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, rolesNeeded, tags, maxCollaborators, imageUrl, githubLink, liveLink, status } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description and category are required' });
    }
    const project = await Project.create({
      title: title.trim(), description: description.trim(),
      category, status: status || 'open',
      rolesNeeded: rolesNeeded || [], tags: tags || [],
      maxCollaborators: maxCollaborators || 5,
      imageUrl: imageUrl || '', githubLink: githubLink || '', liveLink: liveLink || '',
      owner: req.userId,
    });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { projectsOwned: project._id } });
    const populated = await project.populate('owner', 'username field avatar');
    res.status(201).json({ message: 'Project created', project: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('POST /projects error:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the project owner can edit this' });
    }
    const allowed = ['title', 'description', 'category', 'status', 'rolesNeeded', 'tags', 'maxCollaborators', 'imageUrl', 'githubLink', 'liveLink'];
    allowed.forEach((field) => { if (req.body[field] !== undefined) project[field] = req.body[field]; });
    await project.save();
    const updated = await project.populate('owner', 'username field avatar');
    res.json({ message: 'Project updated', project: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the project owner can delete this' });
    }
    await project.deleteOne();
    await User.findByIdAndUpdate(req.userId, { $pull: { projectsOwned: project._id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/join
router.post('/:id/join', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() === req.userId) return res.status(400).json({ error: 'You are the owner' });
    if (project.collaborators.map(String).includes(req.userId)) return res.status(400).json({ error: 'Already a collaborator' });
    if (project.collaborators.length >= project.maxCollaborators) return res.status(400).json({ error: 'Project is full' });
    if (project.status === 'closed') return res.status(400).json({ error: 'Project is closed' });
    project.collaborators.push(req.userId);
    if (project.status === 'open') project.status = 'in-progress';
    await project.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { projectsJoined: project._id } });
    const populated = await project.populate([
      { path: 'owner', select: 'username field avatar' },
      { path: 'collaborators', select: 'username field avatar' },
    ]);
    res.json({ message: 'Joined project', project: populated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join project' });
  }
});

// POST /api/projects/:id/leave
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    project.collaborators = project.collaborators.filter((c) => c.toString() !== req.userId);
    if (project.collaborators.length === 0 && project.status === 'in-progress') project.status = 'open';
    await project.save();
    await User.findByIdAndUpdate(req.userId, { $pull: { projectsJoined: project._id } });
    res.json({ message: 'Left project' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave project' });
  }
});

// POST /api/projects/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const liked = project.likes.map(String).includes(req.userId);
    if (liked) {
      project.likes = project.likes.filter((l) => l.toString() !== req.userId);
    } else {
      project.likes.push(req.userId);
    }
    await project.save();
    res.json({ liked: !liked, likeCount: project.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// POST /api/projects/:id/review
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner.toString() === req.userId) return res.status(400).json({ error: 'Cannot review own project' });
    const existingIndex = project.reviews.findIndex((r) => r.user.toString() === req.userId);
    if (existingIndex > -1) {
      project.reviews[existingIndex].rating = rating;
      project.reviews[existingIndex].comment = comment || '';
    } else {
      project.reviews.push({ user: req.userId, rating, comment: comment || '' });
    }
    await project.save();
    const populated = await project.populate('reviews.user', 'username avatar');
    res.json({ message: 'Review saved', averageRating: populated.averageRating, reviews: populated.reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;