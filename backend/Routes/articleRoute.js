const express = require("express");
const { createArticle, getArticles, updateArticle, deleteArticle } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const router = express.Router();

router.route('/createArticle').post(isAuthenticated, isAuthorizedUser, createArticle);
router.route('/getArticles').get(isAuthenticated, getArticles);
router.route('/updateArticle/:id').put(isAuthenticated, isAuthorizedUser, updateArticle);
router.route('/deleteArticle/:id').delete(isAuthenticated, isAuthorizedUser, deleteArticle);

module.exports = router;