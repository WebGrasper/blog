const express = require("express");
const { createArticle, getArticles, updateArticle, deleteArticle, getSingleArticle, searchQueryArticles, filterArticles } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const multer = require("multer");
const upload = multer();
const router = express.Router();

router.route('/createArticle/:token').post(isAuthenticated, isAuthorizedUser, upload.array('articleImage',2), createArticle);
router.route('/getSingleArticle/:title').get(getSingleArticle);
router.route('/getArticles').get(getArticles);
// router.route('/searchArticles/:title').get(searchQueryArticles);
router.route('/filterArticles').post(filterArticles);
router.route('/updateArticle/:id').put(isAuthenticated, isAuthorizedUser, updateArticle);
router.route('/deleteArticle/:id').delete(isAuthenticated, isAuthorizedUser, deleteArticle);

module.exports = router;
