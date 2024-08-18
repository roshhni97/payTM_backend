const express = require("express");
const rootRouter = require("./routes");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const port = process.env.PORT || 3100;

const app = express();
console.log("app started");
app.use(cors());
app.use(express.json());
app.get("/", (req, res, next) => {
  res.send("Hello World");
});
app.use("/api/v1/", rootRouter);

app.listen(port);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

mongoose.connection.on("error", (err) => {
  console.log("err", err);
});

mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});
