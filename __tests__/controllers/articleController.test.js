const articleService = require('../../Services/articleService');
const imageService = require('../../Services/imageService');
const sendResponse = require('../../utils/responseHandler');
const articleController = require('../../Controllers/articleController');

describe('articleController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { 
      body: {}, 
      query: {}, 
      params: {}, 
      user: { id: 'user1' },
      files: []
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('createArticle', () => {
    it('should upload images and create article', async () => {
      req.files = [{ originalname: 'test.jpg' }];
      req.body = { title: 'Test Article Title With Enough Words To Pass' };
      
      vi.spyOn(imageService, 'uploadImages').mockResolvedValue(['http://img.url']);
      vi.spyOn(articleService, 'createArticle').mockResolvedValue({ _id: '1', title: 'Test' });

      await articleController.createArticle(req, res, next);

      expect(imageService.uploadImages).toHaveBeenCalled();
      expect(articleService.createArticle).toHaveBeenCalled();
    });
  });

  describe('getArticles', () => {
    it('should call articleService.getArticles', async () => {
      vi.spyOn(articleService, 'getArticles').mockResolvedValue({ articles: [] });

      await articleController.getArticles(req, res, next);

      expect(articleService.getArticles).toHaveBeenCalled();
    });
  });
});
