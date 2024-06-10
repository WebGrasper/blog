const { mongoose } = require("mongoose");

const validateTitleWords = (value) => {
  const wordCount = value.trim().split(/\s+/).length;
  return wordCount > 9 && wordCount < 26;
};

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: [true, "Duplicate title cannot be use."],
    required: [true, "title can't be blank"],
    validate: {
      validator: validateTitleWords,
      message: "Title must be between 9 and 26 words",
    },
  },
  description:{
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Description can't be blank"],
    },
  articleImage: [
    {
      type: String,
      required: [true, "Please upload atleast an image"],
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  },
});

const commentSchema = new mongoose.Schema({
  articleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Article",
  },
  commenterID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  commentBody: {
    type: String,
    minLength: [1, "Comment cannot be empty"],
    maxLength: [500, "Comment cannot exceed 500 characters"],
  },
  commentedAt: {
    type: Date,
    default: Date.now,
  },
});

const articleModel = mongoose.model("article", articleSchema);
const commentModel = mongoose.model("Comment", commentSchema);

module.exports = {
  articleModel,
  commentModel,
};
