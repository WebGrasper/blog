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
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default: Date.now,
    }
})

module.exports = new mongoose.model('article', articleSchema);