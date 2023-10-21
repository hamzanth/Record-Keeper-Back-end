const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    category: {
        type: String,
        default: "Unspecified"
    },
    name: {
        type: String,   
        required: true,  
    },
    addedDate: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0,
    },
    image: {
        type: String,
        default: "image unavailable at the moment"
    },
    boughtCount: {
        type: Number,
        default: 0
    }
})

const Products = mongoose.model("product", productSchema)

module.exports = Products