const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var cors = require("cors");
const todoRoutes = require("./routes/todo");
const authRoutes = require("./routes/auth");

const cron = require("node-cron");
const { sendInvoice, billUpdater } = require("./utils/helper");

//db connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch(console.log("DB NOT CONNECTED"));

const PORT = 8081;

// Modify your CORS configuration to specify the allowed origin
const allowedOrigins = ["https://td-front.vercel.app", process.env.ZAP_WEBHOOK]; // Define your allowed origins here

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in the allowed list or if it's undefined (non-browser requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
};


// middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());


//routes
app.get("/", (req, res) => {
  res.send(
    "<h1>hello there!! Postman link for the backend - https://www.getpostman.com/collections/905cfb6344b05509378a</h1>"
  );
});


cron.schedule("59 23 28-31 * *", async () => {
  // This runs at 00:00 on the first day of every month
  sendInvoice();
  console.log("cron is triggered");
});


app.use("/", todoRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`haloo running in port${PORT}..`));
