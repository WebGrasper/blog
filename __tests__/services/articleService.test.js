const { articleModel, commentModel } = require('../../Models/articleModel');
const articleService = require('../../Services/articleService');

describe('articleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should throw error if title already exists', async () => {
      vi.spyOn(articleModel, 'findOne').mockResolvedValue({ title: 'Duplicate' });
      
      await expect(articleService.createArticle({ title: 'Duplicate' }, 'user1'))
        .rejects.toThrow('Duplicate article cannot be added.');
    });
  });

  describe('getArticles', () => {
    it('should return articles and pagination info', async () => {
      vi.spyOn(articleModel, 'countDocuments').mockResolvedValue(20);
      
      const mockQuery = {
        find: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limitFields: vi.fn().mockReturnThis(),
        paginate: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation(resolve => resolve([{ title: 'Art 1' }]))
      };
      
      vi.spyOn(articleModel, 'find').mockReturnValue(mockQuery);
      
      const result = await articleService.getArticles({ limit: 10, page: 1 });
      
      expect(result.totalCount).toBe(20);
      expect(result.articles).toHaveLength(1);
    });
  });
});
