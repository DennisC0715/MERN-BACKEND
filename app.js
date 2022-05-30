// Import All Dependencies
const dotenv = require("dotenv");
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

// Configure ENV File & require database connnection file
dotenv.config({ path: "./config.env" });
require("./db/conn");
const port = process.env.PORT;

// Require Model
const Users = require("./models/userSchema");
const Message = require("./models/msgSchema");

//These Method is Used to Get Data and cookie from frontEnd
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

//Registration
app.post("/register", async (req, res) => {
  try {
    //Get Body OR Data
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const createUser = new Users({
      username: username,
      email: email,
      password: password,
    });

    // Save Method is Used to Create User or Insert User
    // But Before Saving Or inserting, Password will Hash
    // Because of Hashing. After Hash it will save to DB
    const created = await createUser.save();
    console.log(created);
    res.status(200).send("Registered");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login User

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // Find User if Exist
    const user = await Users.findOne({ email: email });
    if (user) {
      // Vertify Password
      const isMatch = await bcryptjs.compare(password, user.password);
      if (isMatch) {
        // Generate Token Which is Define in User Schema
        const token = await user.generateToken();
        res.cookie("jwt", token, {
          // Expires Token in 24 hours
          expires: new Date(Date.now() + 86400000),
          httpOnly: true,
        });
        res.status(200).send("LoggedIn");
      } else {
        res.status(400).send("InVilid Credentials");
      }
    } else {
      res.status(400).send("email is not exist in our system, please register");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// MESSAGE
app.post("/message", async (req, res) => {
  try {
    //Get Body OR Data
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;

    const createMsg = new Message({
      name: name,
      email: email,
      message: message,
    });

    const created = await createMsg.save();
    console.log(created);
    res.status(200).send("Registered");
  } catch (error) {
    res.status(400).send(error);
  }
});

//Logout

app.get("/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  res.status(200).send("USER LOGGED OUT");
});

// Run Server
app.listen(port, () => {
  console.log("Server is Listening");
});
