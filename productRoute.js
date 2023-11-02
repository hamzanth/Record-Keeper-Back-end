'use strict';

const express = require("express");
const multer = require('multer')
// const upload = multer({dest: "uploads"})
const fs = require('fs')
const path = require('path')
const Products = require("./models/products");
const Users = require("./models/Users").Users
const Prods = require("./models/Users").Prods
const Cart = require("./models/Users").Cart
const Stocks = require("./models/stock")
const router = express.Router();


const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now())
    }
})

const upload = multer({storage: storage})

router.get("/", function(req, res, next){
    // res.json({feedback: "this is a product for number product"});
    Products.find({})
    .then((products) => {
        res.json({products: products});
    })
    .catch(error => {
        next(error)
    })
});


router.post("/", upload.single('image'), async function(req, res, next){
    console.log("the post route has been hit again")
    // console.log(req.file.filename)
    console.log(req.body)
    const name = req.body.name
    const price = req.body.price
    const quantity = req.body.quantity
    const category = req.body.category

    // console.log(name, price, quantity, image)

    await Products.create({
        name: name,
        price: price,
        quantity: quantity,
        category: category,
        image: req.file ? {
            data: fs.readFileSync('uploads/' + req.file.filename),
            conteType: 'image/jpg',
            filename: req.file.filename
        } : "null" 
    })
    .then(product => {
        res.status(200).json({product: product})
    })
    .catch(error => {
        next(error)
    })
})

router.put("/:pid/update", upload.single("image"), async function(req, res, next){
    const productId = req.params.pid
    const name = req.body.name
    const price = req.body.price
    const quantity = req.body.quantity
    const category = req.body.category
    console.log(req.file)
    // const image = req.body.image

    // const product = await Products.findById(productId)
    // console.log(product.image.filename)
    if (req.file){
        try{
        const product = await Products.findById(productId)
        fs.unlinkSync(__dirname + '/uploads/' + product.image.filename)
        product.name = name
        product.price = price
        product.quantity = quantity
        product.category = category
        product.image = {
            data: fs.readFileSync('uploads/' + req.file.filename),
            conteType: 'image/jpg',
            filename: req.file.filename
        }
        await product.save()
        res.status(201).json({message: "Successfully Updated", product: product})
        }
        catch(error){
            next(error)
        }
    }
    else{
        try{
            const product = await Products.findById(productId)
            product.name = name
            product.price = price
            product.quantity = quantity
            product.category = category
            await product.save()
            res.status(201).json({message: "Successfully Updated", product: product})
            }
            catch(error){
                next(error)
            }
    }
    // try{
        // const product = await Products.findOneAndUpdate({_id: productId}, {$set: {name: name, price: price, quantity: quantity, image: image}})
        // res.status(201).json({message: "Successfully Updated", product: product})
    //     
    
    
})

router.delete("/:pid/delete", async function(req, res, next){
    const productId = req.params.pid
    await Products.findOneAndDelete({_id: productId})
    .then(product => {
        res.status(200).json({message: "Successfully Deleted Product", product: product})
    })
    .catch(error => {
        next(error)
    })
})

router.get("/top-products", async function(req, res, next){
    await Products.find({})
    .sort({boughtCount: -1})
    .limit(10)
    .then(products => {
        res.status(200).json({message: "successfully gotten the top ten products", products: products})
    })
    .catch(error => {
        next(error)
    })
})

router.get("/:pid", function(req, res){
    res.json({feedback: "this is a product for number " + req.params.pid  + " product"});
});

router.post("/", function(req, res){
    res.json({
        feedback: "this is a product home route",
        body: req.body
    });
});

router.post("/addtotimeline", async function(req, res, next){
    const userId = req.body.id
    const transObj = req.body.transObj
    const owing = req.body.owing
    const owed = req.body.owed
    const name = req.body.name
    // console.log("the username of the person is " + username)
    const prodKeys = Object.keys(transObj.prod)
    console.log(prodKeys)
    const cartArray = []
    for (let i=0; i<prodKeys.length; i++){
        const prodKey = prodKeys[i]

        const product = await Products.findOne({name: prodKey})
        product.quantity = product.quantity - transObj.prod[prodKey].quantity
        product.boughtCount = product.boughtCount + transObj.prod[prodKey].quantity
        try{
            await product.save()
            await Cart.create({name: prodKey, quantity: transObj.prod[prodKey].quantity, price: transObj.prod[prodKey].price})
            .then(async (cart) => {
                console.log(cart)
                cartArray.push(cart)
            })
            .catch(error => {
                console.log("An error occured")
                return next(error)
            })            
        }
        catch(error){
            return next(error)
        }

    }
    console.log(cartArray.length)
    Prods.create({prods: cartArray, type: transObj.type, cleared: transObj.cleared, name: name})
    .then( async (prod) => {
        try{
        
            const user = await Users.findById(userId)
            if (!user){
                const error = new Error("The User could not be found")
                error.status = 401
                return next(error)
            }
            else{
                user.amountOwing = owing
                user.amountOwed = owed
                user.purchaseCount = user.purchaseCount + 1
                user.timeLine.push(prod)
                try{
                    await user.save()
                    Products.find({})
                    .then(products => {
                        res.status(201).json({message: "Successfully Created TimeLine", user: user, products: products})
                    })
                    .catch(error => {
                        return next(error)
                    })
                }
                catch(err){
                    return next(err)
                }
            }
        }
        catch(error){
            next(error)
        }
    })
})

router.put("/makedeposit", async function(req, res, next){
    const customerId = req.body.id
    const transObj = req.body.newTransaction
    const owing = req.body.amountOwing
    const owed = req.body.amountOwed
    const user = await Users.findById(customerId)
    if (!user){
        const error = new Error("User Not Found")
        error.status = 401
        next(error)
    }
    else{
        user.amountOwing = owing
        user.amountOwed = owed
        user.timeLine.push(transObj)
        try{
            await user.save()
            res.status(201).json({message: "Deposit made successfully", user: user})
        }
        catch(error){
            next(error)
        }
    }
})

router.put("/cleartransaction/:uid/transact/:transid", async function(req, res, next){
    const transId =  req.params.transid
    const userId = req.params.uid
    try{
        const transaction = await Prods.findById(transId)
        transaction.cleared = !transaction.cleared
        try{
            await transaction.save()
            const user = await Users.findById(userId)
            console.log(user.timeLine.id(transId))
            user.timeLine.id(transId).cleared = transaction.cleared
            await user.save()
            res.status(201).json({message: "Transaction Cleared Successfully", user: user})
        }
        catch(error){
            next(error)
        }
    }
    catch(err){
        const error = new Error("Product Not Found")
        error.status = 401
        next()
    }
})

router.put("/allreset", async function(req, res, next){
    const userId = req.body.userid
    console.log(userId)
    try {
        const user = await Users.findById(userId)
        for (let i=0; i<user.timeLine.length; i++){
            if (user.timeLine[i].type === "sale"){
                user.timeLine[i].cleared = true
            }
            try {
                await user.save()
            } catch (error) {
                next(error)
            }
        }
        res.status(201).json({message: "success cleared all the debts", user: user})
    } catch (error) {
        next(error)
    }
})

router.put("/:uid/pay-owed", async function(req, res, next){
    const userId = req.params.uid
    const amountOwed = req.body.amountOwed
    const amountOwing = req.body.amountOwing
    try{
        const user = await Users.findById(userId)
        user.amountOwed = amountOwed
        user.amountOwing = amountOwing
        try{
            await user.save()
            res.status(201).json({message: "successfully cleared cleared your debt", user: user})
        }
        catch(error){
            next(error)
        }
    }
    catch(error){
        next(error)
    }
})

router.get("/get-transact/:transid", async function(req, res, next){
    const transId = req.params.transid
    try {
        const trans = await Prods.findById(transId)
        res.status(200).json({message: "successfully gotten the transaction", transaction: trans})
    } catch (error) {
        return next(error)
    }
})

module.exports = router;