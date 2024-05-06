const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./config/db");
const userRoute = require("./Routes/userRoute");
const articleRoute = require("./Routes/articleRoute");
const error = require("./Middlewares/error");
const cors = require("cors");


const app = express();
const port = process.env.PORT || 7860;

//dotenv config.
dotenv.config({ path: ".env" });

//Enable cookie-parser.
app.use(cookieParser());

//Enable cors for making policies.
app.use(cors({
  origin: '*',
  credentials: true,
}));

//body-parser to parse the data from body in POST method.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//calling database for initialization.
database();

//Using router.
app.use('/app/v1',userRoute);
app.use('/app/v2',articleRoute);

app.get('/',(req,res)=>{
  res.status(200).json({
    success:true,
    message:`Server is working at port ${port}`
  })
})

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
