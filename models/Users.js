const mongoose = require("mongoose");
const Products = require("./products")

const cartSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
})

const prodSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "Unknown"
    },
    date: {
        type: Date,
        default: Date.now
    },
    cleared: {
        type: Boolean,
        default: true
    },
    type: String,
    prods: [cartSchema]
})


const userSChema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    department: {
        type: String,
    },
    amountOwed: {
        type: Number,
        default: 0
    },
    amountOwing: {
        type: Number,
        default: 0
    },
    profilePic: {
        type: String,
        default: "none for now"
    },
    role: {
        type: String,
        default: "basic",
        required: true
    },
    purchaseCount: {
        type: Number,
        default: 0
    },
    debtLimit: {
        type: Number,
        default: 1000
    },
    timeLine: [prodSchema]
});



const Users = mongoose.model("user", userSChema)
const Prods = mongoose.model("prod", prodSchema)
const Cart = mongoose.model("cart", cartSchema)

module.exports.Users = Users;
module.exports.Prods = Prods;
module.exports.Cart = Cart;
