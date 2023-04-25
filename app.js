const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const jwt = require("jsonwebtoken");

require("dotenv").config();
const mongoose = require("mongoose");
const app = express();

// my modules
const {
  getNews,
  generateGetURL,
  generateSearchURL,
} = require("./utilities/UtilityFunctions.js");
const { vars } = require("./utilities/Vars.js");

const { User, Item } = require("./models.js");
const { verifyToken } = require("./middlewares.js");

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN,
//   })
// );

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // app.use(bodyParser.json()) // to parse json request from axios to js object

/* 
we dont need body parser and express.json as we are neither getting any form data nor we need to parse any request body

// app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
// app.use(express.json()); // app.use(bodyParser.json()) // to parse json request body from axios to js object
*/

async function main() {
  await mongoose.connect(process.env.ATLAS_URI);
  console.log("connected to mongodb");
}

main().catch((err) => console.log(err));

app.get("/api/top-headlines", verifyToken, async (req, res) => {
  // console.log(req.query);

  const category = req.query.category;
  const country = req.query.country;
  const URL = generateGetURL(category, country, process.env.API_KEY);

  if (URL === vars.badURL) {
    res.status(400).send(statusText.MISSING_PARAMS);
  }

  getNews(req, res, URL);
});

app.get("/api/search", verifyToken, async (req, res) => {
  // console.log(req.query);

  const user = req.person;

  const keyword = req.query.keyword;
  const URL = generateSearchURL(keyword, process.env.API_KEY);

  if (URL === vars.badURL) {
    res.status(400).send(statusText.INVALID_KEYWORD);
  }

  await User.findOneAndUpdate(
    {
      username: user.username,
      password: user.password,
    },
    { $push: { searchHistory: keyword } }
  );

  getNews(req, res, URL);
});

app.post("/api/register", async (req, res) => {
  try {
    // console.log(req.body);
    const user = req.body;
    const newUser = new User(user);
    // console.log(newUser);

    await newUser.save();
    res.status(200).send({ statusText: "Registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ statusText: "Registered failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    // console.log(req.body);
    const user = req.body;
    // console.log(user);

    const foundUser = await User.findOne({
      username: user.username,
      password: user.password,
    });
    if (foundUser) {
      console.log(foundUser);
      jwt.sign(
        { username: user.username, password: user.password },
        process.env.TOKEN_SECRET,
        (jwtError, token) => {
          if (jwtError || !token) {
            // console.log(jwtError);
            res.status(400).send({ statusText: "Invalid credentials" });
          } else {
            res
              .status(200)
              .send({ statusText: "Logged in successfully", token: token });
          }
        }
      );
    } else {
      res.status(500).send({ statusText: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ statusText: "Invalid credentials" });
  }
});

app.post("/api/like-item", verifyToken, async (req, res) => {
  try {
    // console.log(req.body);
    const user = req.person;
    // console.log(user);
    const URL = req.query.itemURL;
    // console.log(req.query);

    const username = req.username;

    // console.log("-------------------------");
    const foundUser = await User.findOne({
      username: user.username,
      password: user.password,
    });

    // console.log(foundUser);

    if (foundUser) {
      let isLiked = false;

      if (foundUser.likedItemsURL.includes(URL)) {
        const newArr = [];
        foundUser.likedItemsURL.forEach((item) => {
          if (item !== URL) {
            newArr.push(item);
          }
        });

        foundUser.likedItemsURL = newArr;
      } else {
        isLiked = true;
        foundUser.likedItemsURL.push(URL);
      }

      // console.log(foundUser);
      // console.log(isLiked);

      const updatedUser = await foundUser.save();
      // console.log(updatedUser);

      const updatedItem = await Item.findOneAndUpdate(
        { url: URL },
        { $inc: { likes: isLiked ? 1 : -1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // console.log(updatedItem);

      if (isLiked) {
        res
          .status(200)
          .send({ statusText: "Liked successfully", likes: updatedItem.likes });
      } else {
        res.status(200).send({
          statusText: "Unliked successfully",
          likes: updatedItem.likes,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      statusText: "Sorry! couldn't perform the operation",
    });
  }
});

app.get("/api/history", verifyToken, async (req, res) => {
  try {
    const user = req.person;
    console.log(user);

    const userDoc = await User.findOne(
      {
        username: user.username,
        password: user.password,
      },
      { searchHistory: 1 }
    );

    console.log(userDoc);

    // userDoc.searchHistory = [
    //   "wiefn wkjfnjwnf wkwnfkwnfnkw wknfeknwf wnfkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",
    //   "sksf jwi efnwnf wkfenkweef wkeefnkwnf kwnfkwnfe nkwej nfnkwef",

    //   "skjfnwjfkwnef",
    //   "skjnfknfknwfkw",
    //   "wkejnefjwnfkjnwkfnkw kwnfkwnfw wknfwknf wekfnwknfw fkwe ef",
    // ];

    res
      .status(200)
      .send({ statusText: "Success", history: userDoc.searchHistory });
  } catch (error) {
    // console.log(error);
    // res.status(500).send({ statusText: "Registered failed" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`NewsX server is listening on port ${port}`);
});

/* todos
exists function
*/
