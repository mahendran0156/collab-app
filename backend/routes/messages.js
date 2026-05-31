import express from 'express';
import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { requireAuth } from './auth.js';

const router = express.Router();

// GET /api/messages/:projectId
router.get('/:projectId', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const isOwner = project.owner.toString() === req.userId;
    const isCollaborator = project.collaborators.map(String).includes(req.userId);
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Only project members can view messages' });
    const skip = (Number(page) - 1) * Number(limit);
    const [messages, total] = await Promise.all([
      Message.find({ project: projectId }).sort({ createdAt: 1 }).skip(skip).limit(Number(limit)).populate('sender', 'username avatar field'),
      Message.countDocuments({ project: projectId }),
    ]);
    res.json({ messages, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages/:projectId
router.post('/:projectId', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Message content is required' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const isOwner = project.owner.toString() === req.userId;
    const isCollaborator = project.collaborators.map(String).includes(req.userId);
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Only project members can send messages' });
    const message = await Message.create({ project: projectId, sender: req.userId, content: content.trim() });
    const populated = await message.populate('sender', 'username avatar field');
    res.status(201).json({ message: populated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== req.userId) return res.status(403).json({ error: 'Can only delete own messages' });
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;