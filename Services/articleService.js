const { articleModel, commentModel } = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require('../utils/apiFeatures');
const { PAGINATION } = require('../config/constants');

/**
 * Service to handle article operations
 */
const articleService = {
    /**
     * Create a new article
     */
    createArticle: async (articleData, userId) => {
        const { title } = articleData;

        // Check for duplicate title
        const existingArticle = await articleModel.findOne({ title });
        if (existingArticle) {
            throw new ErrorHandler(302, "Duplicate article cannot be added.");
        }

        const article = await articleModel.create({
            ...articleData,
            createdBy: userId,
        });

        if (!article) {
            throw new ErrorHandler(302, "Article cannot created!");
        }

        return article;
    },

    /**
     * Add a comment to an article
     */
    addComment: async (articleID, commenterID, commentBody) => {
        const comment = await commentModel.create({
            articleID,
            commenterID,
            commentBody,
        });

        if (!comment) {
            throw new ErrorHandler(302, "Comment cannot added. Please try again.");
        }

        return comment;
    },

    /**
     * Get all articles with features (filter, sort, paginate)
     */
    getArticles: async (query, baseFilter = {}) => {
        const totalCount = await articleModel.countDocuments(baseFilter);
        
        const features = new APIFeatures(articleModel.find(baseFilter), query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const articles = await features.query;
        
        const limit = query.limit * 1 || PAGINATION.DEFAULT_LIMIT;
        const page = query.page * 1 || PAGINATION.DEFAULT_PAGE;

        return {
            articles,
            totalCount,
            limit,
            page,
            totalPages: Math.ceil(totalCount / limit)
        };
    },

    /**
     * Increment article views
     */
    incrementViews: async (articleID) => {
        const article = await articleModel.findById(articleID);
        if (!article) {
            throw new ErrorHandler(404, "Article not found");
        }

        article.impressions = (article.impressions || 0) + 1;
        await article.save();
        
        return article.impressions;
    },

    /**
     * Delete an article
     */
    deleteArticle: async (articleId, userId) => {
        const article = await articleModel.findById(articleId);
        if (!article) {
            throw new ErrorHandler(404, "Article not found!");
        }

        if (article.createdBy.toString() !== userId) {
            throw new ErrorHandler(403, "You are not authorized to delete this article!");
        }

        await article.remove();
        return true;
    }
};

module.exports = articleService;
