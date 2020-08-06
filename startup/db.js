const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(
      `mongodb://KellyEgesa:Bartholomew@1007@cluster0.bkfbu.mongodb.net/<dbname>?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    )
    .then(() => {
      console.log("connected to the database");
    })
    .catch((err) => console.error("couldnot connect to MongoDb", err));
};
