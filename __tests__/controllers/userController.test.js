const userService = require('../../Services/userService');
const imageService = require('../../Services/imageService');
const userModel = require('../../Models/userModel');
const sendResponse = require('../../utils/responseHandler');
const userController = require('../../Controllers/userController');

describe('userController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { body: {}, query: {}, params: {}, user: { id: 'user1' } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  describe('signup', () => {
    it('should call userService.signup and return success', async () => {
      req.body = { email: 'test@test.com' };
      vi.spyOn(userService, 'signup').mockResolvedValue({ email: 'test@test.com' });

      await userController.signup(req, res, next);

      expect(userService.signup).toHaveBeenCalledWith(req.body);
    });
  });

  describe('getMyDetails', () => {
    it('should return user details', async () => {
        vi.spyOn(userModel, 'findById').mockResolvedValue({ username: 'test' });

        await userController.getMyDetails(req, res, next);
        expect(userModel.findById).toHaveBeenCalledWith('user1');
    });
  });
});
