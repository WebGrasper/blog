const express = require("express");
const { createArticle, getArticles, updateArticle, deleteArticle } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const multer = require("multer");
const upload = multer();
const router = express.Router();

router.route('/createArticle').post(isAuthenticated, isAuthorizedUser, upload.array('articleImage',2), createArticle);
router.route('/getArticles').get(isAuthenticated, getArticles);
router.route('/updateArticle/:id').put(isAuthenticated, isAuthorizedUser, updateArticle);
router.route('/deleteArticle/:id').delete(isAuthenticated, isAuthorizedUser, deleteArticle);

module.exports = router;