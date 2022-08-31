const { vars } = require("./Vars.js");
const axios = require("axios").default;

function exists(item) {
  if (item && item !== "") {
    return true;
  }

  return false;
}

function generateGetURL(category, country, apiKey) {
  if (!exists(category) && !exists(country)) {
    // return vars.badURL; // NEWS API needs atleast one param
  }

  let URL = "https://newsapi.org/v2/top-headlines?";

  if (exists(category)) {
    URL += "category=" + category + "&";
  }

  if (exists(country)) {
    URL += "country=" + country + "&";
  }

  URL += "apiKey=" + apiKey;

  return URL;
}

function generateSearchURL(keyword, apiKey) {
  keyword = keyword.trim(); // remove spaces from end
  keyword = keyword.replace(/ /g, "+"); // replace all spaces with a plus

  if (!exists(keyword)) {
    return vars.badURL; // NEWS API needs atleast one search keyword
  }

  let URL =
    "https://newsapi.org/v2/everything?q=" + keyword + "&apiKey=" + apiKey;

  return URL;
}

async function getNews(req, res, URL) {
  try {
    const response = await axios.get(URL);

    res.send(response.data.articles);

    /* very imp to return response.data.articles not the response else it will give a circular json error */
  } catch (error) {
    // console.error(error);
    res.error(error); // use res.error so its recieved as an error at the client side
  }
}

module.exports = { getNews, generateGetURL, generateSearchURL };
