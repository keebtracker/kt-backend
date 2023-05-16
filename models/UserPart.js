const { Decimal128 } = require("mongodb");
const mongoose = require("mongoose");

const UserPartSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  partId: {
    type: String,
  },
  buildIdList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Build" }],
  datePurchased: {
    type: Date,
  },
  purchasedPrice: {
    type: Decimal128,
  },
  purchasedFrom: {
    type: String,
  },
}, { collection: 'userParts-co'});

module.exports = mongoose.model("UserPart", UserPartSchema);
