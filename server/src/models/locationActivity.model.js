const mongoose = require("mongoose");

const locationActivitySchema = new mongoose.Schema(
  {
    day: {
      type: Date,
      required: true,
    },
    latitudeCell: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitudeCell: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    loginCount: {
      type: Number,
      required: true,
      min: 1,
      default: 0,
    },
  },
  { timestamps: true },
);

locationActivitySchema.index(
  { day: 1, latitudeCell: 1, longitudeCell: 1 },
  { unique: true },
);

module.exports =
  mongoose.models.LocationActivity ||
  mongoose.model("LocationActivity", locationActivitySchema);
