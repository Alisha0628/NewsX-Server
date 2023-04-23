const jwt = require("jsonwebtoken");

////////////////////////////////////////////////////////////////////////////////////////

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");
  // console.log(token);

  if (!token) {
    return res.status(401).send({ statusText: "Invalid token" });
  }

  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    req.person = data;

    // console.log(req.username);

    next();
  } catch (err) {
    // console.log(err.message);

    res.status(401).send({ statusText: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
};
