const express = require("express");
const { createArticle, getArticles } = require("../Controllers/articleController");
const { isAuthenticated, isAuthorizedUser } = require("../Middlewares/auth");
const router = express.Router();

router.route('/createArticle').post(isAuthenticated, isAuthorizedUser, createArticle);
router.route('/getArticles').get(isAuthenticated, getArticles);

module.exports = router;