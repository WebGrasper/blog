const userModel = require('../../Models/userModel');
const sendEmail = require('../../utils/sendEmail');
const userService = require('../../Services/userService');

vi.mock('../../utils/sendEmail', () => vi.fn());

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw error if user already exists', async () => {
      vi.spyOn(userModel, 'findOne').mockResolvedValue({ email: 'test@test.com' });
      
      await expect(userService.signup({ email: 'test@test.com' }))
        .rejects.toThrow('User already exist!');
    });

    it('should create a new user and send OTP', async () => {
      const userData = {
        username: 'testuser',
        email: 'new@test.com',
        password: 'Password123!',
        role: 'user'
      };

      vi.spyOn(userModel, 'findOne').mockResolvedValue(null);
      const mockUser = {
        ...userData,
        getOtp: vi.fn().mockReturnValue(123456),
        save: vi.fn().mockResolvedValue(true)
      };
      vi.spyOn(userModel, 'create').mockResolvedValue(mockUser);

      const result = await userService.signup(userData);

      expect(userModel.create).toHaveBeenCalled();
      expect(result.email).toBe('new@test.com');
    });
  });
});
