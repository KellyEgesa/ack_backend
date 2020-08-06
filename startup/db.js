const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(
      `mongodb://KellyEgesa:Bartholomew1007@ds045465.mlab.com:45465/heroku_d4vwwmnb`,
      {
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    )
    .then(() => {
      console.log("connected to the database");
    })
    .catch((err) => console.error("couldnot connect to MongoDb", err));
};
