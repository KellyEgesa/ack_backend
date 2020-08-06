const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const { User, validate } = require("../models/user");
const express = require("express");

const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const result = await User.findById(req.user._id).select("-password");
  res.send(result);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ name: req.body.name });
  if (!user) return res.status(400).send("Name doesnt exists");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(token);
});

module.exports = router;
