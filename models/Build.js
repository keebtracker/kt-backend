const mongoose = require("mongoose");

const BuildSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  originalBuilder: {
    type: String,
  },
  partIdList : [{ type: mongoose.Schema.Types.ObjectId, ref: "UserPart" }],
}, { collection: 'builds-co'});

module.exports = mongoose.model("Build", BuildSchema);
