process.env.IMAGEKIT_PUBLIC = 'pk_test';
process.env.IMAGEKIT_SECRET = 'sk_test';
process.env.IMAGEKIT_URL = 'http://test.com';

const imageKit = require('../../utils/imageKit');
const imageService = require('../../Services/imageService');

describe('imageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImages', () => {
    it('should upload images successfully', async () => {
      const mockFiles = [
        { size: 1000, buffer: Buffer.from('abc'), originalname: '1.jpg' }
      ];
      vi.spyOn(imageKit, 'uploadImagesViaImageKit').mockResolvedValue('http://url.com/1.jpg');

      const result = await imageService.uploadImages(mockFiles);
      expect(result).toEqual(['http://url.com/1.jpg']);
    });
  });
});
