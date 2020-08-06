const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(
      `mongodb+srv://KellyEgesa:${config.get(
        "passworddb"
      )}@ack.lyu4n.mongodb.net/<dbname>?retryWrites=true&w=majority
      `,
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
