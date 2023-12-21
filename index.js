const express= require("express");
const app = express();
require('dotenv').config()
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors')
const todoRoutes=require("./routes/todo")
const userRoutes=require("./routes/userRoutes")


//db connection
mongoose.connect(process.env.DATABASE,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex: true
}).then(()=>{
    console.log("DB CONNECTED")
}).catch(
    console.log("DB NOT CONNECTED")
);

const PORT =  8081;
// Modify your CORS configuration to specify the allowed origin
const allowedOrigins = ['https://td-front.vercel.app']; // Define your allowed origins here

const corsOptions = {
  origin: function (origin, callback) {
    // Check if the origin is in the allowed list or if it's undefined (non-browser requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  }
};
//middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
//routes
app.get("/",(req,res)=>{
    res.send('<h1>hello there!! Postman link for the backend - https://www.getpostman.com/collections/905cfb6344b05509378a</h1>')
})
app.use("/",userRoutes);
app.use("/",todoRoutes);


app.listen(PORT,()=>console.log(`haloo running in port${PORT}..`))
