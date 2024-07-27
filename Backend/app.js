const cookieParser = require("cookie-parser");
const express = require("express");
const errorMiddleware = require('./middleWare/error');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

//config
dotenv.config({ path: "backend/config/config.env" });

const app = express();
app.use(express.json()); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

//Available Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/product', require("./routes/productRoute"));
app.use('/api/order', require("./routes/orderRoute"));
app.use("/api/payment", require("./routes/paymentRoute"));

//middleware for Errors
app.use(errorMiddleware);

module.exports = app;