const express = require("express");
const { Services, validate } = require("../models/Services");
const router = express.Router();

router.post("/", async (req, res) => {
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

module.exports = router;
