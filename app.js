const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  bodyParser = require("body-parser"),
  // path = require('path'),
  cors = require("cors");
let database = process.env.MONGODB_URI || "mongodb://localhost:27017/portal";

//connecting mongoose //#endregion
mongoose.connect(database, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
mongoose.connection
  .once("open", () => console.log("connected"))
  .on("error", () => console.log("reconnect"));



//using body-parser //#endregion

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(bodyParser.json({ limit: "10mb" }));

const schoolRouter = require("./routes/school/school"),
  institutionRouter = require("./routes/institution/institution");

//middleware

app.use("/school", schoolRouter);
app.use("/institution", institutionRouter);
app.use("/schooldocuments", express.static("schooldocuments"));

//invalid Route
app.use((req, res) => {
  let err = new Error();
  err.message = "route not found";
  err.status = 404;
  res.status(err.status).json({
    message: err.message,
  });
});

//export app
module.exports = app;
