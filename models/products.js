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
    quantityDescription: {
        type: String,
        default:"" 
    },
    quantityRange: {
        type: String,
        default: "Less than"
    },
    price: {
        type: Number,
        default: 0,
    },
    priceDescription: {
        type: String,
        default: ""
    },
    image: {
        data: Buffer,
        contentType: String,
        filename: String
        // type: String,
        // default: null
    },
    boughtCount: {
        type: Number,
        default: 0
    }
})

const Products = mongoose.model("product", productSchema)

module.exports = Products