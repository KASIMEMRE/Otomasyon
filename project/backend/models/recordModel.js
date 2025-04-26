import mongoose from 'mongoose';

const recordSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Record = mongoose.model('Record', recordSchema);

export default Record;