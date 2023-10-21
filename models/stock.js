const mongoose = require("mongoose")


const stockSchema = new mongoose.Schema({
    name: {
        type: String,   
        required: true,  
    },
    quantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        defualt: 0,
    },
    image: {
        type: String
    }
}) 

const Stocks = mongoose.model("Stock", stockSchema)

module.exports = Stocks