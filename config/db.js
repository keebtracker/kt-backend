const mongoose = require("mongoose");

const connectDB = async () => {
  conn = await mongoose.connect(process.env.ATLAS_URI, {
    dbName: "keebtracker-db",
  });

  console.log("connected to database");
};

module.exports = connectDB;
