require('../setup');
const request = require('supertest');
const app = require('../../app');
const { articleModel } = require('../../Models/articleModel');
const userModel = require('../../Models/userModel');

describe('Articles Integration Tests', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Create a verified user and get token
    const user = await userModel.create({
      username: 'author',
      email: 'author@test.com',
      password: 'Password123!',
      role: 'user'
    });
    userId = user._id;

    const res = await request(app)
      .post('/app/v1/signin')
      .send({ email: 'author@test.com', password: 'Password123!' });
    
    token = res.body.token;
  });

  it('should get all articles', async () => {
    await articleModel.create({
      title: 'This Is A Very Long Test Article Title To Pass Word Count Validation',
      description: 'Content',
      category: 'Technology',
      createdBy: userId,
      articleImage: ['img.jpg']
    });

    const res = await request(app).get('/app/v2/getArticles');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.articles).toHaveLength(1);
  });

  it('should return 404 for non-existent article', async () => {
    const res = await request(app).get('/app/v2/getSingleArticle/none');
    expect(res.statusCode).toBe(404);
  });
});
