import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message must be at most 1000 characters'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
}, {
  timestamps: true,
});

// Always sort messages by creation time
messageSchema.index({ project: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
