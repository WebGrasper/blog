const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const database = require('./config/db');
const userRoute = require('./Routes/userRoute');
const articleRoute = require('./Routes/articleRoute');
const error = require('./Middlewares/error');
const { decodePayload } = require('./Middlewares/decodePayload');

dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 7860;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://ik.imagekit.io', 'https://images.unsplash.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);
app.use('/app/v1/signin', authLimiter);
app.use('/app/v1/signup', authLimiter);
app.use('/app/v1/forgetPassword', authLimiter);

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use(decodePayload);

database();

app.use('/app/v1', userRoute);
app.use('/app/v2', articleRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Server is running on port ${port}`,
  });
});

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Requested URL ${req.path} not found.`,
  });
});

app.use(error);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
