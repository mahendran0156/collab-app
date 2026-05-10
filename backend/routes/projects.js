const router = require('express').Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    const projects = await Project.find(query).populate('owner', 'name avatar field').sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({ ...req.body, owner: req.user.id });
    await project.save();
    await project.populate('owner', 'name avatar field');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar bio field')
      .populate('collaborators', 'name avatar field')
      .populate('reviews.user', 'name avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!project.collaborators.includes(req.user.id)) {
      project.collaborators.push(req.user.id);
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/review', auth, async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const project = await Project.findById(req.params.id);
    project.reviews.push({ user: req.user.id, comment, rating });
    await project.save();
    await project.populate('reviews.user', 'name avatar');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const idx = project.likes.indexOf(req.user.id);
    if (idx === -1) project.likes.push(req.user.id);
    else project.likes.splice(idx, 1);
    await project.save();
    res.json({ likes: project.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
