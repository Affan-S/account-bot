const mongoose = require("mongoose");
require('dotenv');

const connectDB = async () => {
  try {

    const uri = process.env.MONGO_URI;
    mongoose.set("strictQuery", true);
    await mongoose
        .connect(uri, {
          useNewUrlParser: true,
        })
        .catch((error) => console.log(error));
        console.log("MONGODB CONNECTED SUCCESSFULLY!");
    }catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = connectDB;
