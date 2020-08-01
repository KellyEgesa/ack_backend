const express = require("express");
const mongoose = require("mongoose");
const { Worshippers, validate } = require("../models/Worshippers");
const { Services } = require("../models/Services");
const Fawn = require("fawn");
const router = express.Router();

Fawn.init(mongoose);

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const services = await Services.findById(req.body.service);
  if (!services) return res.status(400).send("Invalid service");

  if (services.seatsLeft == 0) return res.status(400).send("Service is full");

  let worshipper = new Worshippers({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    dob: req.body.dob,
    services: {
      _id: services._id,
      name: services.name,
      time: services.time,
    },
  });

  try {
    new Fawn.Task()
      .save("Worshippers", worshipper)
      .update(
        "services",
        { _id: services._id },
        {
          $inc: { seatsLeft: -1 },
        }
      )
      .run();

    res.send(worshipper);
  } catch (ex) {
    res.status(500).send("Somethhing went wrong");
  }
});

router.get("/", async (req, res) => {
  const result = await Worshippers.find();
  res.send(result);
});

module.exports = router;
