const morgan = require("morgan");
const express = require("express");
var cors = require("cors");

const Worshippers = require("../route/Worshippers");
const Services = require("../route/services");
const User = require("../route/user");

module.exports = function (app) {
  app.use(cors());
  app.use(express.json());
  app.use("/api/worshippers", Worshippers);
  app.use("/api/services", Services);
  app.use("/api/user", User);
};
