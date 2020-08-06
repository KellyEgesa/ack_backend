const express = require("express");
const app = express();

require("./startup/db")();
require("./startup/routes")(app);
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 3030;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.export = server;
