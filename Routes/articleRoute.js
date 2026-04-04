const express = require('express');
const {
  createArticle, getArticles, updateArticle, deleteArticle,
  getSingleArticle, filterArticles, search, addComment,
  getComments, viewsIncrementer, dailyArticles, trendingArticles,
} = require('../Controllers/articleController');
const { isAuthenticated, isAuthorizedUser } = require('../Middlewares/auth');
const {
  validateCreateArticle,
  validateAddComment,
  validateFilterArticles,
} = require('../Middlewares/validators');
const multer = require('multer');

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.post(
  '/createArticle',
  isAuthenticated,
  isAuthorizedUser,
  upload.array('articleImage', 2),
  createArticle
);

router.post('/addComment', isAuthenticated, validateAddComment, addComment);
router.post('/filterArticles', validateFilterArticles, filterArticles);
router.put('/updateArticle/:id', isAuthenticated, isAuthorizedUser, updateArticle);
router.delete('/deleteArticle/:id', isAuthenticated, isAuthorizedUser, deleteArticle);

router.get('/getComments', getComments);
router.get('/viewsIncrementer', viewsIncrementer);
router.get('/getSingleArticle/:title', getSingleArticle);
router.get('/getArticles', getArticles);
router.get('/dailyArticles', dailyArticles);
router.get('/trendingArticles', trendingArticles);
router.get('/search', search);

module.exports = router;
