const {articleModel, commentModel} = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { uploadImagesViaImageKit } = require('../utils/imageKit');

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    let { title, description, category } = JSON.parse(JSON.stringify(req.body));
    let ImageArray = req.files;
    let url = [];

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

    // Check for duplicate title
    const existingArticle = await articleModel.findOne({ email: req.body.title });
    if (existingArticle) {
        return next(new ErrorHandler(302, "Duplicate articles cannot be added."));
    }

    for (let i in ImageArray) {
        const imageSize = ImageArray[i].size;
        if (imageSize > MAX_IMAGE_SIZE) {
            return next(new ErrorHandler(413, "Image size is greater than 5 MB."));
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
        category,
        articleImage: url,
        createdBy: req.user.id,
    });
    if (!article) {
        return next(new ErrorHandler(302, "Article cannot created!"));
    }
    res.status(200).json({
        success: true,
        message:"Article created successfully.",
        article,
    })
});

module.exports.addComment = catchAsyncError(async (req, res, next) =>{
    let comment = await commentModel.create({
        articleID: req.query.articleID,
        commenterID: req.user.id,
        commentBody: req.body.commentBody,
    });

    if (!comment) {
        return next(new ErrorHandler(302, "Comment cannot added. Please try again."));
    }

    res.status(200).json({
        success: true,
        message:"Comment added successfully."
    })
})

module.exports.getComments = catchAsyncError(async (req, res, next) =>{

    let comments = await commentModel.find({
        articleID: req.query.articleID,
    });
    
    if (!comments) {
        return next(new ErrorHandler(302, "Comments cannot fetched. Please try again."));
    }

    res.status(200).json({
        success: true,
        comments
    })
})

module.exports.getSingleArticle = catchAsyncError(async (req, res, next) => {
    
    // Extract the title from the URL parameter
    const encodedTitle = req.params.title;

    // Decode the URL-encoded title
    const articleTitleFromURL = decodeURIComponent(encodedTitle).replace(/-/g, ' ');

    const article = await articleModel.findOne({ title: articleTitleFromURL });
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
        return next(new ErrorHandler(404, "Articles not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

//This API is only working for stashify blog webApp
module.exports.searchQueryArticles = catchAsyncError(async (req, res, next) => {
    let { title } = req.params;
    if (title === "all") {
        // Redirect to the getArticles handler
        return exports.getArticles(req, res, next);
    }
    // console.log('get articles conditionally');
    let article = await articleModel.find({ title: { $regex: `^${title}`, $options: "i" } });
    if (!article.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

module.exports.search = catchAsyncError(async (req, res, next)=>{
    let encodedTitle = req.query.name;

    const articleTitleFromURL = decodeURIComponent(encodedTitle).replace(/-/g, ' ');

    let articles = await articleModel.find({
        $or: [
        { title: { $regex: `^${articleTitleFromURL}`, $options: "i" } },
        { category: { $regex: `^${articleTitleFromURL}`, $options: "i" } }
    ]});
    
    if(!articles.length){
        if (!articles.length) {
            return next(new ErrorHandler(404, "Article not available!"));
        }    
    }
    res.status(200).json({
        success: true,
        articles,
    });
})

module.exports.filterArticles = catchAsyncError(async (req, res, next) => {
    const { data } = req.body;
    // console.log(typeof data === 'string');
    let article = undefined;
    if (typeof data === 'string') {
        article = await articleModel.find({ title: { $regex: `^${data}`, $options: "i" } });
    } else {
        const { food, travel, politics, technology } = data;
        const categoryForFilter = {
            Food: food,
            Travel: travel,
            Politics: politics,
            Technology: technology,
        };

        const filteredCategory = {
            $or: Object.keys(categoryForFilter).filter(key => categoryForFilter[key] !== null).map(key => ({ category: key })),
        }
        // console.log(filteredCategory);
        article = await articleModel.find(filteredCategory);
    }

    if (!article.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }

    res.status(200).json({
        success: true,
        article,
    });

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
