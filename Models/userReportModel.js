const mongoose = require("mongoose");

const userReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name can't be blank"],
  },
  patientID: {
    type: Number,
    unique: true,
    required: [true, "PatientID can't be blank"],
  },
  value:[{
    type:Number,
    required:[true,"Value can't be blank"]
    }],
  type: {
    type: String,
    required: [true, "Type can't be blank"],
  },
});

module.exports = mongoose.model("userreport", userReportSchema);
