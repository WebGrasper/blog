const {articleModel, commentModel} = require('../Models/articleModel');
const ErrorHandler = require('../utils/errorHandler');
const { catchAsyncError } = require('../Middlewares/catchAsyncError');
const { uploadImagesViaImageKit } = require('../utils/imageKit');

module.exports.createArticle = catchAsyncError(async (req, res, next) => {
  let { title, category } = req.body;
  let description;

  if (typeof req.body.description === 'string') {
    try {
      const decoded = Buffer.from(req.body.description, 'base64').toString('utf-8');
      description = JSON.parse(decoded);
    } catch {
      try { description = JSON.parse(req.body.description); } catch {
        return next(new ErrorHandler(400, 'Invalid description format.'));
      }
    }
  } else {
    description = req.body.description;
  }

  const existingArticle = await articleModel.findOne({ title });
  if (existingArticle) {
    return next(new ErrorHandler(409, 'An article with this title already exists.'));
  }

  const ImageArray = req.files || [];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const urls = [];
  const folderPath = '/WG-ARTICLES-IMAGES/';

  for (const image of ImageArray) {
    if (image.size > MAX_IMAGE_SIZE) {
      return next(new ErrorHandler(413, 'Image size cannot exceed 5 MB.'));
    }
    const url = await uploadImagesViaImageKit(image.buffer, image.originalname, folderPath);
    urls.push(url);
  }

  const article = await articleModel.create({
    title,
    description,
    category,
    articleImage: urls,
    createdBy: req.user.id,
    isLegacyContent: false,
  });

  res.status(201).json({
    success: true,
    message: 'Article created successfully.',
    article,
  });
});

module.exports.addComment = catchAsyncError(async (req, res, next) => {
  const comment = await commentModel.create({
    articleID: req.query.articleID,
    commenterID: req.user.id,
    commentBody: req.body.commentBody,
  });
  if (!comment) return next(new ErrorHandler(500, 'Comment could not be added.'));
  res.status(201).json({ success: true, message: 'Comment added successfully.' });
});

module.exports.getComments = catchAsyncError(async (req, res, next) => {
  const comments = await commentModel.find({ articleID: req.query.articleID });
  res.status(200).json({ success: true, comments: comments || [] });
});

module.exports.getSingleArticle = catchAsyncError(async (req, res, next) => {
  const articleTitleFromURL = decodeURIComponent(req.params.title).replace(/-/g, ' ');
  const article = await articleModel.findOne({ title: articleTitleFromURL });
  if (!article) return next(new ErrorHandler(404, 'Article not found.'));
  res.status(200).json({ success: true, article });
});

module.exports.viewsIncrementer = catchAsyncError(async (req, res, next) => {
  const article = await articleModel.findByIdAndUpdate(
    req.query.articleID,
    { $inc: { impressions: 1 } },
    { new: true }
  );
  if (!article) return next(new ErrorHandler(404, 'Article not found.'));
  res.status(200).json({ success: true, message: `Current views: ${article.impressions}` });
});

module.exports.getArticles = catchAsyncError(async (req, res, next) => {
  const articles = await articleModel.find().sort({ createdAt: -1 });
  if (!articles.length) return next(new ErrorHandler(404, 'No articles available.'));
  res.status(200).json({ success: true, articles });
});

module.exports.dailyArticles = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 8;
  const articles = await articleModel.find().sort({ createdAt: -1 }).limit(limit);
  if (!articles.length) return next(new ErrorHandler(404, 'No articles available.'));
  res.status(200).json({ success: true, articles });
});

module.exports.trendingArticles = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 4;
  const articles = await articleModel.find().sort({ impressions: -1 }).limit(limit);
  if (!articles.length) return next(new ErrorHandler(404, 'No articles available.'));
  res.status(200).json({ success: true, articles });
});

module.exports.search = catchAsyncError(async (req, res, next) => {
  const query = decodeURIComponent(req.query.name || '').replace(/-/g, ' ');
  const articles = await articleModel.find({
    $or: [
      { title: { $regex: `^${query}`, $options: 'i' } },
      { category: { $regex: `^${query}`, $options: 'i' } },
    ],
  });
  if (!articles.length) return next(new ErrorHandler(404, 'No articles found.'));
  res.status(200).json({ success: true, articles });
});

module.exports.filterArticles = catchAsyncError(async (req, res, next) => {
  const { data } = req.body;
  let articles;
  if (typeof data === 'string') {
    articles = await articleModel.find({ title: { $regex: `^${data}`, $options: 'i' } });
  } else {
    const catMap = { Food: data.food, Travel: data.travel, Politics: data.politics, Technology: data.technology };
    const filter = { $or: Object.keys(catMap).filter((k) => catMap[k] !== null).map((k) => ({ category: k })) };
    articles = await articleModel.find(filter);
  }
  if (!articles.length) return next(new ErrorHandler(404, 'No articles found.'));
  res.status(200).json({ success: true, articles });
});

module.exports.updateArticle = catchAsyncError(async (req, res, next) => {
  const article = await articleModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!article) return next(new ErrorHandler(404, 'Article not found.'));
  res.status(200).json({ success: true, message: 'Article updated successfully.' });
});

module.exports.deleteArticle = catchAsyncError(async (req, res, next) => {
  const article = await articleModel.findByIdAndDelete(req.params.id);
  if (!article) return next(new ErrorHandler(404, 'Article not found.'));
  res.status(200).json({ success: true, message: 'Article deleted successfully.' });
});
