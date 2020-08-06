const express = require("express");
const mongoose = require("mongoose");
const { Worshippers, validate } = require("../models/Worshippers");
const { Services } = require("../models/Services");
const Fawn = require("fawn");
const nodemailer = require("nodemailer");
const config = require("config");
var smtpTransport = require("nodemailer-smtp-transport");
var ObjectID = require("mongodb").ObjectID;
const config = require("config");

const router = express.Router();
Fawn.init(mongoose);

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const checkemail = await Worshippers.findOne({
    email: req.body.email,
  });

  if (checkemail) return res.status(400).send("Email already exists");

  const phonenumber = await Worshippers.findOne({
    phonenumber: req.body.phonenumber,
  });

  if (phonenumber) return res.status(400).send("PhoneNumber already exists");

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
  const saved = await worshipper.save();

  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "ackstpeters.kahawasukari.booking@gmail.com",
        pass: config.emailpass,
      },
    })
  );

  let mailDetails = {
    from: "ackstpeters.kahawasukari.booking@gmail.com",
    to: worshipper.email,
    subject: "Confirm service booking",
    text:
      "Kindly click on this link to confirm your booking" +
      " " +
      config.get("frontend") +
      "confirmed/" +
      saved._id,
  };

  transporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("an error occurred");
    } else {
      console.log("Email sent successfully");
    }
  });
  res.send(saved);
});

router.get("/", async (req, res) => {
  const result = await Worshippers.find();
  res.send(result);
});

router.get("/:id", async (req, res) => {
  const ob = ObjectID.isValid(req.params.id);
  if (!ob) return res.status(404).send("Page not found");
  const result = await Worshippers.findById(req.params.id);
  if (!result) return res.status(404).send("Page not found");

  if (result.confirmed) return res.status(400).send("You have already booked");

  const services = await Services.findById(result.services._id);

  if (!services) return res.status(400).send("Invalid service");

  if (services.seatsLeft == 0)
    return res.status(400).send("Service is full, you confirmed too late");

  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "ackstpeters.kahawasukari.booking@gmail.com",
        pass: config.emailpass,
      },
    })
  );

  let mailDetails = {
    from: "ackstpeters.kahawasukari.booking@gmail.com",
    to: result.email,
    subject: "Your are booked!",
    text: `Your are booked for ${services.name} service at ${services.time} `,
  };

  transporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log("an error occurred");
    } else {
      console.log("Email sent successfully");
    }
  });

  try {
    new Fawn.Task()
      .update(
        "services",
        { _id: result.services._id },
        {
          $inc: { seatsLeft: -1 },
        }
      )
      .run();
    const trial = await Worshippers.findByIdAndUpdate(
      { _id: req.params.id },
      { confirmed: true }
    );
    const results = await Worshippers.findById(req.params.id);
    res.send(results);
  } catch (ex) {
    res.status(500).send("Somethhing went wrong");
    console.log(ex);
  }
});

router.delete("/:id", async (req, res) => {
  const ob = ObjectID.isValid(req.params.id);
  if (!ob) return res.status(404).send("Page not found");
  const Worshipper = await Worshippers.findByIdAndDelete(req.params.id);
  if (!Worshipper) return res.status(400).send("Worshipper not found");

  try {
    new Fawn.Task()
      .update(
        "services",
        { _id: Worshipper.services._id },
        {
          $inc: { seatsLeft: +1 },
        }
      )
      .run();
    res.send(Worshipper);
  } catch (ex) {
    res.status(500).send("Somethhing went wrong");
    console.log(ex);
  }
});

setInterval(async function () {
  try {
    var d = new Date();
    if (d.getDay() === 1 && d.getHours() == 0) {
      await Worshippers.deleteMany();
      await Services.deleteMany();
    }
  } catch (ex) {
    console.log(ex);
  }
}, 1800000);
module.exports = router;
