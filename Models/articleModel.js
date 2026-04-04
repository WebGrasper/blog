const mongoose = require('mongoose');

const validateTitleWords = (value) => {
  const wordCount = value.trim().split(/\s+/).length;
  return wordCount > 9 && wordCount < 26;
};

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      unique: true,
      required: [true, "Title can't be blank"],
      trim: true,
      validate: {
        validator: validateTitleWords,
        message: 'Title must be between 10 and 25 words.',
      },
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Description can't be blank"],
    },
    isLegacyContent: {
      type: Boolean,
      default: false,
    },
    articleImage: [
      {
        type: String,
        required: [true, 'Please upload at least one image'],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Politics', 'Technology', 'Railway', 'Sports',
        'Markets', 'India News', 'International News', 'Health', 'Education',
      ],
    },
  },
  { timestamps: true }
);

articleSchema.index({ title: 'text', category: 1 });

const commentSchema = new mongoose.Schema({
  articleID: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  commenterID: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  commentBody: {
    type: String,
    minLength: [1, 'Comment cannot be empty'],
    maxLength: [500, 'Comment cannot exceed 500 characters'],
    trim: true,
  },
  commentedAt: { type: Date, default: Date.now },
});

const articleModel = mongoose.model('article', articleSchema);
const commentModel = mongoose.model('Comment', commentSchema);

module.exports = { articleModel, commentModel };
