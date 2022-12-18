const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios").default;
require("dotenv").config();
const app = express();

// my modules
const {
  getNews,
  generateGetURL,
  generateSearchURL,
} = require("./utilities/UtilityFunctions.js");
const { vars } = require("./utilities/Vars.js");

////////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN,
//   })
// );

app.use(cors());
/* 
we dont need body parser and express.json as we are neither getting any form data nor we need to parse any request body

// app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
// app.use(express.json()); // app.use(bodyParser.json()) // to parse json request body from axios to js object
*/

app.get("/api/top-headlines", (req, res) => {
  // console.log(req.query);

  const category = req.query.category;
  const country = req.query.country;
  const URL = generateGetURL(category, country, process.env.API_KEY);

  if (URL === vars.badURL) {
    res.status(400).send(statusText.MISSING_PARAMS);
  }

  getNews(req, res, URL);
});

app.get("/api/search", (req, res) => {
  // console.log(req.query);

  const keyword = req.query.keyword;
  const URL = generateSearchURL(keyword, process.env.API_KEY);

  if (URL === vars.badURL) {
    res.status(400).send(statusText.INVALID_KEYWORD);
  }

  getNews(req, res, URL);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`NewsX server is listening on port ${port}`);
});

/* todos
exists function
*/
