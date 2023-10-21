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

module.exports = router