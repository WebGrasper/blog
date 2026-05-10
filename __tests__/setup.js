const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  } catch (error) {
    console.error("Failed to start MongoDB Memory Server:", error);
  }
}, 300000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Mock environment variables
process.env.JWT_SECRET_KEY = 'test_secret';
process.env.JWT_EXPIRE = '1h';
process.env.COOKIE_EXPIRE = '7';
process.env.PORT = '7860';
