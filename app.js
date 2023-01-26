const express = require("express");
const bodyParser = require("body-parser");
const bcryptjs = require("bcryptjs");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./backend/config/db.js");
const userModel = require("../blog/backend/Models/userModel.js");
const sendToken = require("../blog/backend/utils/jwtToken");

const app = express();
const port = 3000 || process.env.PORT;

//dotenv config.
dotenv.config({ path: "./backend/config/config.env" });

//Enable cookie-parser.
app.use(cookieParser());

//body-parser to parse the data from body in POST method.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//calling database for initialization.
database();

//SIGN-UP
app.post("/signup", async (req, res) => {
  //Checking if requesting user is already exists via email.
  const user = await userModel.findOne({ email: req.body.email });
  if (user) {
    res.status(302).json({
      success: false,
      message: "user already exists",
    });
  } else {
    let { username, email, password } = req.body;

    //Encryption for password.
    password = await bcryptjs.hash(password, 12);

    //registering a new user.
    const user = await userModel.create({
      username,
      email,
      password,
    });
    res.status(201).json({
      success: true,
      message: "Saved user successfully",
    });
  }
});

//SIGN-IN
app.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (user) {
    let isPassword = await bcryptjs.compare(password, user.password);
    if (isPassword) {
      sendToken(user, 200, res);
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid login details!",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid login details!",
    });
  }
});

//LOGOUT.
app.put("/logout",async(req,res,next)=>{
  res.status(200).cookie('token',null,{
    expires: new Date(Date.now()),
    httpOnly:true,
  }).json({
    success:true,
    message:"Logout successfully!",
  });
})

//getting all users data
app.get("/getUsers", async (req, res, next) => {
  const user = await userModel.find();
  res.status(200).json(user);
});

app.listen(port, () => {
  console.log(`Server is working on ${port}`);
});
