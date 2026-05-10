require('../setup');
const request = require('supertest');
const app = require('../../app');
const userModel = require('../../Models/userModel');
const sendEmail = require('../../utils/sendEmail');

vi.mock('../../utils/sendEmail');

describe('Auth Integration Tests', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'user'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/app/v1/signup')
      .send(testUser);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    const user = await userModel.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
    expect(user.otp).toBeDefined();
  });

  it('should not allow login without verification', async () => {
    // Signup first
    await request(app).post('/app/v1/signup').send(testUser);

    const res = await request(app)
      .post('/app/v1/signin')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('verify');
  });

  it('should login successfully after verification', async () => {
    // Signup
    await request(app).post('/app/v1/signup').send(testUser);
    
    // Get OTP from DB
    const user = await userModel.findOne({ email: testUser.email });
    const otp = user.otp;

    // Verify
    const verifyRes = await request(app)
      .post('/app/v1/confirmRegistration')
      .send({ otp });
    
    expect(verifyRes.statusCode).toBe(200);

    // Login
    const res = await request(app)
      .post('/app/v1/signin')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.header['set-cookie']).toBeDefined();
  });
});
