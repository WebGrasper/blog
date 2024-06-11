const express = require("express");
const { createArticle, getArticles, updateArticle, deleteArticle, getSingleArticle, searchQueryArticles, filterArticles, search, addComment, getComments, viewsIncrementer, dailyArticles, trendingArticles } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const multer = require("multer");
const upload = multer();
const router = express.Router();

router.route('/createArticle').post(isAuthenticated, isAuthorizedUser, upload.array('articleImage',2), createArticle);
router.route('/addComment').post(isAuthenticated, addComment);
router.route('/getComments').get(getComments);
router.route('/viewsIncrementer').get(viewsIncrementer);
router.route('/getSingleArticle/:title').get(getSingleArticle);
router.route('/getArticles').get(getArticles);
router.route('/dailyArticles').get(dailyArticles);
router.route('/trendingArticles').get(trendingArticles);
router.route('/search').get(search);
// router.route('/searchArticles/:title').get(searchQueryArticles);
router.route('/filterArticles').post(filterArticles);
router.route('/updateArticle/:id').put(isAuthenticated, isAuthorizedUser, updateArticle);
router.route('/deleteArticle/:id').delete(isAuthenticated, isAuthorizedUser, deleteArticle);

module.exports = router;
