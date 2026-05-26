import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500, default: '' },
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title must be at most 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description must be at most 2000 characters'],
  },
  category: {
    type: String,
    required: true,
    enum: ['development', 'design', 'music', 'social-media', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'closed'],
    default: 'open',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  rolesNeeded: [{ type: String, trim: true }],
  tags: [{ type: String, trim: true }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviews: [reviewSchema],
  maxCollaborators: { type: Number, default: 5 },
  imageUrl: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  liveLink: { type: String, default: '' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: average rating
projectSchema.virtual('averageRating').get(function () {
  if (!this.reviews.length) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual: like count
projectSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual: collaborator count
projectSchema.virtual('collaboratorCount').get(function () {
  return this.collaborators.length;
});

// Indexes for fast filtering
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ createdAt: -1 });

export default mongoose.model('Project', projectSchema);
