const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const Worshippers = mongoose.model(
  "Worshippers",
  new mongoose.Schema({
    firstname: {
      required: true,
      type: String,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    lastname: {
      required: true,
      type: String,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
    email: {
      required: true,
      type: String,
      unique: true,
      trim: true,
      unique: true,
    },
    phonenumber: {
      required: true,
      type: Number,
      unique: true,
    },
    dob: {
      required: true,
      type: Number,
    },
    services: {
      type: new mongoose.Schema({
        name: {
          required: true,
          type: String,
          minlength: 3,
          maxlength: 20,
          trim: true,
        },
        time: { required: true, type: String },
      }),
    },
    confirmed: {
      type: Boolean,
      default: false,
      required: true,
    },
  })
);

function validateWorshippers(user) {
  const schema = Joi.object({
    firstname: Joi.string().min(2).max(25).required(),
    lastname: Joi.string().min(2).max(25).required(),
    service: Joi.objectId().min(3).max(40).required(),
    email: Joi.string().min(5).max(60).required().email(),
    phonenumber: Joi.string()
      .min(10)
      .max(10)
      .regex(/^([0][7])([0-9]{8})$/),
    dob: Joi.number().min(1962).max(2007),
  });
  return schema.validate(user);
}
module.exports.Worshippers = Worshippers;
module.exports.validate = validateWorshippers;
