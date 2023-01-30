const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const database = require("./backend/config/db.js");
const userRoute = require("../blog/backend/Routes/userRoute");

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

//Using router.
app.use('/app/v1',userRoute);

app.listen(port, () => {
  console.log(`Server is working on ${port}`);
});
