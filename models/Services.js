const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const servicesSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  time: { required: true, type: String },
  seatsLeft: { required: true, type: Number, min: 0, max: 100 },
});

const Services = mongoose.model("Services", servicesSchema);

function validateServices(services) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    time: Joi.string()
      .regex(/^([0-9]{2})\:([0-9]{2})$/)
      .required(),
    seatsLeft: Joi.number().min(0).max(100).required(),
  });
  return schema.validate(services);
}

module.exports.Services = Services;
module.exports.validate = validateServices;
