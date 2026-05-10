const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./config/db");
const userRoute = require("./Routes/userRoute");
const articleRoute = require("./Routes/articleRoute");
const ErrorHandler = require("./utils/errorHandler");
const error = require("./Middlewares/error");
const cors = require("cors");


const helmet = require("helmet");
const { CORS_WHITELIST } = require("./config/constants");

const app = express();
const port = process.env.PORT || 7860;

// dotenv config.
dotenv.config({ path: ".env" });

// Security headers.
app.use(helmet());

// Enable cookie-parser.
app.use(cookieParser());

// Enable CORS with whitelist.
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || CORS_WHITELIST.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// body-parser to parse the data from body in POST method.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// calling database for initialization.
if (process.env.NODE_ENV !== 'test') {
  database();
}

// Using router.
app.use('/app/v1', userRoute);
app.use('/app/v2', articleRoute);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: `Server is working at port ${port}`
  })
})

// Handling error when user request for invalid route.
app.all('*', (req, res, next) => {
  next(new ErrorHandler(404, `Requested URL ${req.path} not found!`));
});

// NodeJS uncaught error handler.
app.use(error);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is working on ${port}`);
  });
}

module.exports = app;
