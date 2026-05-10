const express = require("express");
const { createArticle, getArticles, updateArticle, deleteArticle, getSingleArticle, search, addComment, getComments, viewsIncrementer, dailyArticles, trendingArticles, getMyArticles, getArticleById } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const multer = require("multer");
const upload = multer();
const router = express.Router();

router.route('/createArticle').post(isAuthenticated, upload.array('articleImage',2), createArticle);
router.route('/addComment').post(isAuthenticated, addComment);
router.route('/getComments').get(getComments);
router.route('/viewsIncrementer').get(viewsIncrementer);
router.route('/getSingleArticle/:title').get(getSingleArticle);
router.route('/getArticleById/:id').get(getArticleById);
router.route('/getArticles').get(getArticles);
router.route('/getMyArticles').get(isAuthenticated, getMyArticles);
router.route('/dailyArticles').get(dailyArticles);
router.route('/trendingArticles').get(trendingArticles);
router.route('/search').get(search);
router.route('/updateArticle/:id').put(isAuthenticated, upload.array('articleImage',2), updateArticle);
router.route('/deleteArticle/:id').delete(isAuthenticated, deleteArticle);

module.exports = router;
