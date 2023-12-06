'use strict';

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser").json
const cookieParser = require("cookie-parser")

const logger = require("morgan");
const productRouter = require("./productRoute");
const authRouter = require("./authRoute");
const transactionRouter = require('./transactionRouter')
const app = express();
app.use(cookieParser())
app.use(logger("dev"));
app.use(bodyParser());
app.use(express.static(__dirname + '/public'))

const mongoose = require("mongoose");
const User = require("./models/Users");
mongoose.connect("mongodb+srv://irekpitaanthony10:otVHGw3ieF9EBhm3@cluster0.3v3pcse.mongodb.net/RecordKeeperDB?retryWrites=true&w=majority");
const db = mongoose.connection;
db.on("error", function(error){
    console.error(error);
});
app.use("/uploads", express.static("uploads"))
// app.use(function(req, res, next){
//     res.header("Access-Control-Allow-Origin", "*")
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//     if (req.method == "OPTION"){
//         res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE")
//         return res.status(200).json({})
//     }
//     next()
// })
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods","OPTIONS, GET, POST, PUT, PATCH, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    if (req.method === "OPTIONS"){
        return res.sendStatus(200)
    }
    next()
})

app.use("/products", productRouter)
app.use("/accounts", authRouter)
app.use("/transactions", transactionRouter)

app.use(function(req, res, next){
    let error = new Error("Page Not Found")
    error.status = 404
    next(error)
});

app.use(function(error, req, res, next){
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
    console.log("Server is listening on port 3000");
});