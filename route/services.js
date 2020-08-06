const express = require("express");
const auth = require("../middleware/auth");
const { Services, validate } = require("../models/Services");
const { Worshippers } = require("../models/Worshippers");
const router = express.Router();
const nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var ObjectID = require("mongodb").ObjectID;
const config = require("config");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const service = await new Services({
    name: req.body.name,
    time: req.body.time,
    seatsLeft: req.body.seatsLeft,
  });

  res.send(await service.save());
});
router.get("/", async (req, res) => {
  const services = await Services.find().sort();
  res.send(services);
});
router.get("/:id", auth, async (req, res) => {
  const ob = ObjectID.isValid(req.params.id);
  if (!ob) return res.status(404).send("Page not found");
  const servicess = await Services.findById(req.params.id);
  if (!servicess) return res.status(404).send("Service not found");

  const result = await Worshippers.find({
    confirmed: true,
    services: servicess,
  });
  res.send(result);
});
router.get("/print/:id", auth, async (req, res) => {
  const ob = ObjectID.isValid(req.params.id);
  if (!ob) return res.status(404).send("Page not found");
  const servicess = await Services.findById(req.params.id);
  if (!servicess) return res.status(404).send("Service not found");

  const result = await Worshippers.find({
    confirmed: true,
    services: servicess,
  });
  const fs = require("fs");
  const PDFDocument = require("pdfkit");
  var d = new Date();
  d.setDate(d.getDate() + ((0 + 7 - d.getDay()) % 7));
  function createDOC(result, path) {
    let doc = new PDFDocument({ margin: 50 });

    generateHeader(doc);
    generateTable(doc, result);

    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }
  function generateHeader(doc) {
    doc
      .fontSize(20)
      .text("ACK ST PETERS KAHAWA SUKARI", 0, 40, { align: "center" })
      .fontSize(15)
      .text(`Service: ${servicess.name} Time: ${servicess.time}`, 0, 60, {
        align: "center",
      })
      .fontSize(10)
      .text(`Booking of ${d} of service `, 0, 80, {
        align: "center",
      })
      .moveDown();
  }
  function generateTableRow(doc, y, c1, c2, c3, c4) {
    doc
      .fontSize(10)
      .text(c1, 50, y)
      .text(c2, 150, y)
      .text(c3, 250, y)
      .text(c4, 400, y);
  }
  function generateTable(doc, result) {
    let i,
      resultTableTop = 100;

    for (i = 0; i < result.length; i++) {
      const item = result[i];
      const position = resultTableTop + (i + 1) * 10;
      generateTableRow(
        doc,
        position,
        item.firstname,
        item.lastname,
        item.email,
        item.phonenumber
      );
    }
  }
  createDOC(result, `${servicess.name}.pdf`);
  const transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      auth: {
        user: "ackstpeters.kahawasukari.booking@gmail.com",
        pass: config.get("emailpass"),
      },
    })
  );

  let mailDetails = {
    from: "ackstpeters.kahawasukari.booking@gmail.com",
    to: "ackstpeters.kahawasukari.booking@gmail.com",
    subject: `${servicess.name}`,
    text: `Kindly see attatchment to see those who booked`,
    attachments: [
      {
        filename: `${servicess.name}.pdf`,
        path: `./${servicess.name}.pdf`,
      },
    ],
  };

  transporter.sendMail(mailDetails, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent successfully");
    }
  });

  res.send(result);
});

router.delete("/:id", auth, async (req, res) => {
  const ob = ObjectID.isValid(req.params.id);
  if (!ob) return res.status(404).send("Page not found");
  const service = await Services.findById(req.params.id);
  if (!service) return res.status(400).send("service not found");

  const result = await Worshippers.findOne({
    confirmed: true,
    services: service,
  });

  if (result) {
    res.status(400).send("someone has already booked");
  } else {
    await Services.findByIdAndDelete(req.params.id);
    res.send(service);
  }
});
module.exports = router;
