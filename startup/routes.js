const morgan = require("morgan");
const express = require("express");
const Worshippers = require("../route/Worshippers");
const Services = require("../route/services");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/worshippers", Worshippers);
  app.use("/api/services", Services);
};
