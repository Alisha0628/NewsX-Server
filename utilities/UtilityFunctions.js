const { User, Item } = require("../models.js");
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
    return vars.badURL; // NEWS API needs atleast one param
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
    // console.log(req.person);
    const user = req.person;

    const items = response.data.articles;

    const userDoc = await User.findOne({
      username: user.username,
      password: user.password,
    });

    // console.log(userDoc);

    const storedItems = await Item.find();
    // console.log(storedItems);

    for (let i = 0; i < items.length; i++) {
      items[i].isLiked = false;
      if (userDoc.likedItemsURL.includes(items[i].url)) {
        items[i].isLiked = true;
      }

      items[i].likes = 0;
      for (let j = 0; j < storedItems.length; j++) {
        if (storedItems[j].url === items[i].url) {
          items[i].likes = storedItems[j].likes;
        }
      }
    }

    // const itemsDoc = Item.find()
    const slicedArray = items.slice(0, 4);

    console.log(slicedArray);

    res.send(response.data.articles);

    /* very imp to return response.data.articles not the response else it will give a circular json error */
  } catch (error) {
    console.error(error);
    // res.error(error); // use res.error so its recieved as an error at the client side
  }
}

module.exports = { getNews, generateGetURL, generateSearchURL };
