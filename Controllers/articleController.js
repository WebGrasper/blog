const articleService = require("../Services/articleService");
const imageService = require("../Services/imageService");
const sendResponse = require("../utils/responseHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { articleModel } = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");

/**
 * Article Controller - Handles request/response and delegates to Services
 */

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    // Upload images first
    const urls = await imageService.uploadImages(req.files);
    
    const article = await articleService.createArticle({
        ...req.body,
        articleImage: urls
    }, req.user.id);

    sendResponse(res, 200, "Article created successfully.", { article });
});

module.exports.addComment = catchAsyncError(async (req, res, next) => {
    await articleService.addComment(req.query.articleID, req.user.id, req.body.commentBody);
    sendResponse(res, 200, "Comment added successfully.");
});

module.exports.getComments = catchAsyncError(async (req, res, next) => {
    const { commentModel } = require('../Models/articleModel');
    const comments = await commentModel.find({ articleID: req.query.articleID });
    sendResponse(res, 200, "Success", { comments });
});

module.exports.getSingleArticle = catchAsyncError(async (req, res, next) => {
    const articleTitleFromURL = decodeURIComponent(req.params.title).replace(/-/g, ' ');
    const article = await articleModel.findOne({ title: articleTitleFromURL });
    
    if (!article) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    sendResponse(res, 200, "Success", { article });
});

module.exports.viewsIncrementer = catchAsyncError(async (req, res, next) => {
    const impressions = await articleService.incrementViews(req.query.articleID);
    sendResponse(res, 200, `Current views are ${impressions}`);
});

module.exports.getArticles = catchAsyncError(async (req, res, next) => {
    const result = await articleService.getArticles(req.query);
    sendResponse(res, 200, "Success", result);
});

module.exports.getMyArticles = catchAsyncError(async (req, res, next) => {
    const result = await articleService.getArticles(req.query, { createdBy: req.user.id });
    sendResponse(res, 200, "Success", result);
});

module.exports.trendingArticles = catchAsyncError(async (req, res, next) => {
    req.query.sort = '-impressions';
    const result = await articleService.getArticles(req.query);
    sendResponse(res, 200, "Success", result);
});

module.exports.search = catchAsyncError(async (req, res, next) => {
    const searchTerm = decodeURIComponent(req.query.name).replace(/-/g, ' ');
    const baseQuery = {
        $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { category: { $regex: searchTerm, $options: "i" } }
        ]
    };
    const result = await articleService.getArticles(req.query, baseQuery);
    sendResponse(res, 200, "Success", result);
});

module.exports.updateArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findById(req.params.id);
    if (!article) {
        return next(new ErrorHandler(404, "Article not found!"));
    }

    if (article.createdBy.toString() !== req.user.id) {
        return next(new ErrorHandler(403, "You are not authorized to update this article!"));
    }

    let updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
        updateData.articleImage = await imageService.uploadImages(req.files);
    }

    article = await articleModel.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    sendResponse(res, 200, "Item updated successfully", { article });
});

module.exports.deleteArticle = catchAsyncError(async (req, res, next) => {
    await articleService.deleteArticle(req.params.id, req.user.id);
    sendResponse(res, 200, "Item deleted successfully");
});

module.exports.getArticleById = catchAsyncError(async (req, res, next) => {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
        return next(new ErrorHandler(404, "Article not found!"));
    }
    sendResponse(res, 200, "Success", { article });
});

// Alias for getArticles for dailyArticles
module.exports.dailyArticles = module.exports.getArticles;
