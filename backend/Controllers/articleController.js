const articleModel = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { uploadImagesViaImageKit } = require('../utils/imageKit');




module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    let { title, description } = JSON.parse(JSON.stringify(req.body));
    let ImageArray = req.files;
    let url = [];
    for (let i in ImageArray) {
        url[i] = await uploadImagesViaImageKit(ImageArray[i].buffer, ImageArray[i].originalname);
    }
    let article = await articleModel.create({
        title,
        description,
        articleImage: url,
        createdBy: req.user.id,
    });
    if (!article) {
        return next(new ErrorHandler(302, "Article cannot created!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
});

module.exports.getArticles = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.find();
    if (!article.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

module.exports.updateArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) {
        return next(new ErrorHandler(302, "Article cannot update!"));
    }
    res.status(200).json({
        success: true,
        message: "item update successfully",
    })
})

module.exports.deleteArticle = catchAsyncError(async (req, res, next) => {
    let articleDelete = await articleModel.findByIdAndRemove(req.params.id);
    if (!articleDelete) {
        return next(new ErrorHandler(302, `Resources not found!`));
    }
    res.status(200).json({
        success: true,
        message: "item delete successfully",
    })
})