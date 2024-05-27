const { mongoose } = require("mongoose");

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "title can't be blank"],
        minLength: [4, "Minimum length should be 4 characters"],
        maxLength: [80, "Maximum length should be 80 characters"],
    },
    description:{
        type: String,
        required: [true, "description can't be blank"],
        minLength: [100, "Minimum length should be 100 characters"],
        maxLength: [2000, "Maximum length should be 2000 characters"],
    },
    articleImage:[{
            type:String,
            required:[true,"Please upload atleast an image"]
        }
    ],
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    },
    createdAt:{
        type:Date,
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
        ref: 'Article',
    },
    commenterID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    commentBody: {
        type: String,
        minLength: [1, "Comment cannot be empty"],
        maxLength: [500, "Comment cannot exceed 500 characters"],
    },
    commentedAt: {
        type: Date,
        default: Date.now,
    }
});

const articleModel = mongoose.model('article', articleSchema);
const commentModel = mongoose.model('Comment', commentSchema);

module.exports = {
    articleModel,
    commentModel
};