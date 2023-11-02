const express = require("express")
const router = express.Router()
const Users = require("./models/Users").Users
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const jwtSecret = process.env.JWT_SECRET

router.get("/users", async function(req, res, next){
    try{
        const users = await Users.find({})
        res.status(200).json({
            users: users
        })
    }
    catch(error){
        next(error)
    }
    // .then(users => {
    //     res.status(200).json({
    //         users: users
    //     })
    // })
    // .catch(error => {
    //     next(error)
    // })
})

router.get("/users/:id", async function(req, res, next){
    const userId = req.params.id
    try{
        const user = await Users.findById(userId)
        if (!user){
            res.status(404).json({
                message: "User not found"
            })
        }
        else{
            res.status(200).json({
                message: "ok this the user page",
                user: user
            })
        }
    }
    catch(error){
        next(error)
    }
})

router.put("/:uid/update", async function(req, res, next){
    const userId = req.params.uid
    const username = req.body.username
    const password = req.body.password
    const department = req.body.department
    const image = req.body.image
    if (password.length !== 0)
    {
        await bcrypt.hash(password, 10)
        .then( async (hashPassword) => {
            try{
                const user = await Users.findById(userId)
                user.username = username
                user.password = hashPassword
                user.department = department
                user.image = image
                try{
                    user.save()
                    res.status(200).json({message: "Successfully updated customer", user: user})
                }
                catch(err){
                    next(err)
                }
            }
            catch(error){
                next(error)
            }

        })
    }
    else{
        try{
            const user = await Users.findById(userId)
            user.username = username
            user.department = department
            user.image = image
            try{
                user.save()
                res.status(200).json({message: "Successfully Updated customer", user: user})
            }
            catch(err){
                next(err)
            }
        }
        catch(error){
            next(error)
        }
    }

})

router.put("/debt-limit-update", async function(req, res, next){
    const debtLimit = req.body.debt
    await Users.updateMany({}, {$set: {debtLimit: debtLimit}})
    .then(users => {
        res.status(200).json({message: "Successfully Updated Debt", users: users})
    })
    .catch(error => next(error))
})

router.delete("/:uid/delete", async function(req, res, next){
    const userId = req.params.uid
    await Users.findOneAndDelete({_id: userId})
    .then(user => {
        res.status(200).json({message: "Successfully Deleted User", user: user})
    })
    .catch(error => next(error))
})

router.put("/make-admin", async (req, res, next) => {
    const id = req.body.id
    const role = req.body.role
    // console.log(role)
    // console.log(id)
    if(role === "admin"){
        console.log(role)
        console.log(id)
        const user = await Users.findById(id)
        if (user.role !== "admin"){
            user.role = role
        try{
            await user.save()
            res.status(200).json({
                message: "Successfully Changed User role",
                user: user
            })
        }
        catch(error){
            next(error)
        }
        }
    }
})

router.put("/make-basic", async (req, res, next) => {
    const id = req.body.id
    const role = req.body.role
    // console.log(role)
    // console.log(id)
    if(role === "basic"){
        const user = await Users.findById(id)
        if (user.role !== "basic"){
            user.role = role
        try{
            await user.save()
            res.status(200).json({
                message: "Successfully Changed User role",
                user: user
            })
        }
        catch(error){
            next(error)
        }
        }
    }
})

router.post("/register", function(req, res, next){
    const username = req.body.username
    const password = req.body.password
    const department = req.body.department
    bcrypt.hash(password, 10)
    .then(async (hash) => {
        await Users.create({
            username: username,
            department: department,
            password: hash,
        })
        .then(user => {
            const maxAge = 3 * 60 * 60
            const token = jwt.sign(
                { id: user._id, username: username, role: user.role },
                jwtSecret,
                {expiresIn: maxAge}
            )
            // res.cookie("jwt", token, {
            //     httpOnly: true,
            //     maxAge: maxAge * 1000
            // })
            res.status(200).json({
                message: "User Successfully Created",
                token: token,
                user: user
            })
        })
        .catch(error => {
            // res.status(401).json({
            //     message: "User Not Successfully Created",
            //     error: error.message
            // })
            next(error)
        })
    })
})

router.post("/login", async function(req, res, next){
    const username = req.body.username
    const password = req.body.password
    if (!username || !password){
        // return res.status(400).json({
        //     message: "Username or Password not Present"
        // })
        const error = new Error("Username or Paswword is not present")
        error.status = 400
        next(error)
    }
    else{
        try{
            const user = await Users.findOne({username: username})
            if(!user){
                // res.status(401).json({
                //     message: "Login not successful",
                //     error: "User not found"
                // })
                const error = new Error("Login not Successful")
                error.status = 401
                return next(error)
            }
            else{
                // bcrypt.hash(password, 10)
                // .then(hash => {
                    bcrypt.compare(password, user.password)
                    .then(result => {
                        if (!result){
                            console.log("We are not in result")
                            const error = new Error("Login not Successful")
                            error.status = 401
                            return next(error)
                        }
                        else{
                            const maxAge = 3 * 60 * 60
                            const token = jwt.sign(
                                {id: user._id, username: username, role: user.role}, 
                                jwtSecret, 
                                {expiresIn: maxAge})
                            // res.cookie("jwt", token, {
                            //     httpOnly: true,
                            //     secure: false,
                            //     maxAge: 1000 * maxAge
                            // })
                            res.status(200).json({
                                message: "Login Successful",
                                token: token,
                                user: user
                            })
                        }
                    })
                // })hassing ends
            }
        }
        catch(error){
            next(error)
        }
    }
})

router.get("/top-customers", async function(req, res, next){
    await Users.find({})
    .sort({purchaseCount: -1})
    .limit(10)
    .then(customers => {
        res.status(200).json({message: "successfully gotten the top ten customers", customers: customers})
    })
    .catch(error => {
        next(error)
    })
})

module.exports = router