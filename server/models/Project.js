import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    techStack: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'planning', 'completed'],
      default: 'active',
    },
    githubLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
