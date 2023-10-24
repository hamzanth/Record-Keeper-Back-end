const express = require('express')
const router = express.Router()
const Prods = require('./models/Users').Prods

router.get("/", async function(req, res, next){
    await Prods.find({})
    .then(transactions => {
        res.status(200).json({transactions: transactions})
    })
    .catch(error => next(error))
})

router.post('/get-day', async function(req, res, next){
    const date = req.body.date
    console.log(new Date(date))
    await Prods.find({date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59))
    }})
    .then(prods => {
        res.status(200).json({message: "Successfully gotten all transactions for this day", transactions: prods})
        
    })
    .catch(error => next(error))
})

module.exports = router