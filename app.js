const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./backend/config/db.js");
const userRoute = require("../blog/backend/Routes/userRoute");
const articleRoute = require("../blog/backend/Routes/articleRoute");
const error = require("../blog/backend/Middlewares/error");


const app = express();
const port = 4000 || process.env.PORT;

//dotenv config.
dotenv.config({ path: "./backend/config/config.env" });

//Enable cookie-parser.
app.use(cookieParser());

//body-parser to parse the data from body in POST method.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//calling database for initialization.
database();

app.get('/',(req,res)=>{
  res.send("hello");
});

//Using router.
app.use('/app/v1',userRoute);
app.use('/app/v2/',articleRoute);

//Handling error when user request for invalid route.
app.all('*',(req,res)=>{
  let statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: `Requested URL ${req.path} not found!`,
    stack: err.stack,
  });
});

//NodeJS uncaught error handler.
app.use(error);


app.listen(port, () => {
  console.log(`Server is working on ${port}`);
});
