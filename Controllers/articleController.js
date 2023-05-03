const articleModel = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { uploadImagesViaImageKit } = require('../utils/imageKit');

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    let { title, description } = JSON.parse(JSON.stringify(req.body));
    let ImageArray = req.files;
    let url = [];

    /* Checking image size. Don't allow if size is greater than 1 MB of each image.*/
    for (let i in ImageArray) {
        if (ImageArray[i].size > 1000000) {
            return next(new ErrorHandler(413, "Image size is greater than 1 MB."));
        }
    }

    /* Uploading each image to imageKit.io*/
    for (let i in ImageArray) {
        url[i] = await uploadImagesViaImageKit(ImageArray[i].buffer, ImageArray[i].originalname);
    }

    /* Creating new document.*/
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

module.exports.getSingleArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findById(req.params.articleId);
    if (!article) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

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

module.exports.searchQueryArticles = catchAsyncError(async (req, res, next) => {
    let { title } = req.params;
    let article = undefined;
    if (title === "getAllArticles") {
        console.log('get articles unconditonally');
        article = await articleModel.find();
    } else {
        console.log('get articles conditionally');
        article = await articleModel.find({ title: { $regex: `^${title}`, $options: "i" } });
    }
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