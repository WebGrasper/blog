const {articleModel, commentModel} = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncError } = require("../Middlewares/catchAsyncError");
const { uploadImagesViaImageKit } = require('../utils/imageKit');
const APIFeatures = require('../utils/apiFeatures');

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
    let { title, description, category } = JSON.parse(JSON.stringify(req.body));
    let ImageArray = req.files;
    let url = [];

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

    // Check for duplicate title
    const existingArticle = await articleModel.findOne({ title: req.body.title });
    if (existingArticle) {
        return next(new ErrorHandler(302, "Duplicate article cannot be added."));
    }

    for (let i in ImageArray) {
        const imageSize = ImageArray[i].size;
        if (imageSize > MAX_IMAGE_SIZE) {
            return next(new ErrorHandler(413, "Image size is greater than 5 MB."));
        }
    }

    let folderPath = '/WG-ARTICLES-IMAGES/';
    /* Uploading each image to imageKit.io*/
    for (let i in ImageArray) {
        url[i] = await uploadImagesViaImageKit(ImageArray[i].buffer, ImageArray[i].originalname, folderPath);
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

module.exports.viewsIncrementer = catchAsyncError(async (req, res, next) => {
        // Find the article by articleID in the request query
        const article = await articleModel.findOne({ _id: req.query.articleID });
    
        // If article not found, return an error
        if (!article) {
            return next(new ErrorHandler(404, "Article not found"));
        }
    
        // Increment the impressions attribute by one
        article.impressions = (article.impressions || 0) + 1;
    
        // Save the updated article
        await article.save();
    
        // Send a success response with the updated article
        res.status(200).json({
            success: true,
            message: `Current views are ${article?.impressions}`,
        });
})

module.exports.getArticles = catchAsyncError(async (req, res, next) => {
    const totalCount = await articleModel.countDocuments();
    
    const features = new APIFeatures(articleModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const articles = await features.query;
    
    if (!articles.length) {
        return next(new ErrorHandler(404, "Articles not available!"));
    }

    res.status(200).json({
        success: true,
        totalCount,
        limit: req.query.limit * 1 || 10,
        page: req.query.page * 1 || 1,
        totalPages: Math.ceil(totalCount / (req.query.limit * 1 || 10)),
        articles,
    });
});

module.exports.getMyArticles = catchAsyncError(async (req, res, next) => {
    // Add createdBy to the query params so APIFeatures can filter it
    req.query.createdBy = req.user.id;

    const totalCount = await articleModel.countDocuments({ createdBy: req.user.id });
    
    const features = new APIFeatures(articleModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const articles = await features.query;

    if (!articles) {
        return next(new ErrorHandler(404, "Articles not available!"));
    }

    res.status(200).json({
        success: true,
        totalCount,
        limit: req.query.limit * 1 || 10,
        page: req.query.page * 1 || 1,
        totalPages: Math.ceil(totalCount / (req.query.limit * 1 || 10)),
        articles,
    });
});

module.exports.getArticleById = catchAsyncError(async (req, res, next) => {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
        return next(new ErrorHandler(404, "Article not found!"));
    }
    res.status(200).json({
        success: true,
        article,
    })
})

module.exports.dailyArticles = catchAsyncError(async (req, res, next) => {
    const totalCount = await articleModel.countDocuments();
    
    const features = new APIFeatures(articleModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const articles = await features.query;

    if (!articles.length) {
        return next(new ErrorHandler(404, "Articles not available!"));
    }

    res.status(200).json({
        success: true,
        totalCount,
        limit: req.query.limit * 1 || 10,
        page: req.query.page * 1 || 1,
        totalPages: Math.ceil(totalCount / (req.query.limit * 1 || 10)),
        articles,
    });
});

module.exports.trendingArticles = catchAsyncError(async (req, res, next) => {
    const totalCount = await articleModel.countDocuments();
    
    // Custom sort for trending
    req.query.sort = '-impressions';

    const features = new APIFeatures(articleModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const articles = await features.query;

    if (!articles.length) {
        return next(new ErrorHandler(404, "Articles not available!"));
    }

    res.status(200).json({
        success: true,
        totalCount,
        limit: req.query.limit * 1 || 10,
        page: req.query.page * 1 || 1,
        totalPages: Math.ceil(totalCount / (req.query.limit * 1 || 10)),
        articles,
    });
});

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

module.exports.search = catchAsyncError(async (req, res, next) => {
    let encodedTitle = req.query.name;
    const articleTitleFromURL = decodeURIComponent(encodedTitle).replace(/-/g, ' ');

    // Prepare a base query that matches title OR category from the search term
    const baseQuery = {
        $or: [
            { title: { $regex: articleTitleFromURL, $options: "i" } },
            { category: { $regex: articleTitleFromURL, $options: "i" } }
        ]
    };

    // We can still pass additional filters in req.query (e.g., category=Technology)
    // and APIFeatures will combine them with our base query.
    
    // First, get total count for this search
    const totalCount = await articleModel.countDocuments(baseQuery);

    const features = new APIFeatures(articleModel.find(baseQuery), req.query)
        .filter() // This will apply additional filters from req.query (excluding name/sort/page/limit)
        .sort()
        .limitFields()
        .paginate();

    const articles = await features.query;
    
    if (!articles.length) {
        return next(new ErrorHandler(404, "Article not available!"));
    }

    res.status(200).json({
        success: true,
        totalCount,
        limit: req.query.limit * 1 || 10,
        page: req.query.page * 1 || 1,
        totalPages: Math.ceil(totalCount / (req.query.limit * 1 || 10)),
        articles,
    });
});

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
    let article = await articleModel.findById(req.params.id);
    if (!article) {
        return next(new ErrorHandler(404, "Article not found!"));
    }

    if (article.createdBy.toString() !== req.user.id) {
        return next(new ErrorHandler(403, "You are not authorized to update this article!"));
    }

    let { title, description, category } = JSON.parse(JSON.stringify(req.body));
    let updateData = { title, description, category };

    let ImageArray = req.files;
    if (ImageArray && ImageArray.length > 0) {
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        let url = [];
        for (let i in ImageArray) {
            const imageSize = ImageArray[i].size;
            if (imageSize > MAX_IMAGE_SIZE) {
                return next(new ErrorHandler(413, "Image size is greater than 5 MB."));
            }
        }

        let folderPath = '/WG-ARTICLES-IMAGES/';
        for (let i in ImageArray) {
            url[i] = await uploadImagesViaImageKit(ImageArray[i].buffer, ImageArray[i].originalname, folderPath);
        }
        updateData.articleImage = url;
    }

    article = await articleModel.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    
    res.status(200).json({
        success: true,
        message: "item update successfully",
        article
    })
})

module.exports.deleteArticle = catchAsyncError(async (req, res, next) => {
    let article = await articleModel.findById(req.params.id);
    if (!article) {
        return next(new ErrorHandler(404, `Article not found!`));
    }

    if (article.createdBy.toString() !== req.user.id) {
        return next(new ErrorHandler(403, "You are not authorized to delete this article!"));
    }

    await article.remove();

    res.status(200).json({
        success: true,
        message: "item delete successfully",
    })
})
