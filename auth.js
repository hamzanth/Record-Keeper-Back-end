const express = require("express")
const router = express.Router()
const Users = require("./models/Users")
jwtSecret = process.env.JWT_SECRET

const basicAuth = (req, res, next) => {
    const token = req.cookie.jwt
    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json({message: "Not Authorized"})
            }
            else{
                if (decodedToken.role !== "admin"){
                    res.status(401).json({message: "Not Authorized"})
                }
                else{
                    next()
                }  
            }
        })
    }
    else{
        res.status(401).json({
            message: "Not Authorized"
        })
    }
}

const AdminAuth = (req, res, next) => {
    const token = req.cookie.jwt
    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json({message: "Not Authorized"})
            }
            else{
                if (decodedToken.role !== "basic"){
                    res.status(401).json({message: "Not Authorized"})
                }
                else{
                    next()
                }  
            }
        })
    }
    else{
        res.status(401).json({
            message: "Not Authorized"
        })
    }
}

module.exports.AdminAuth = AdminAuth
module.exports.basicAuth = basicAuth

// router.post("/register", function(req, res, next){
//     const username = req.body.username
//     const password = req.body.password
//     const profPic = req.body.profilePic
//     User.create({
//         username: username,
//         password: password,
//         profilePic: profPic
//     })
//     .then(user => {
//         res.status(200).json({
//             message: "User Successfully Created",
//             user: user
//         })
//     })
//     .catch(error => {
//         res.status(401).json({
//             message: "User Not Successfully Created",
//             error: error.message
//         })
//     })
// })

// router.post("/login", async function(req, res){
//     const username = req.body.username
//     const password = req.body.password
//     if (!username || !password){
//         return res.status(400).json({
//             message: "Username or Password not Present"
//         })
//     }
//     else{
//         try{
//             const user = await User.findOne({username: username, password: password})
//             if(!user){
//                 res.status(401).json({
//                     message: "Login not successful",
//                     error: "User not found"
//                 })
//             }
//             else{
//                 res.status(200).json({
//                     message: "Login Successful",
//                     user: user
//                 })
//             }
//         }
//         catch(error){
//             res.status(400).json({
//                 message: "An error occured",
//                 error: error.message
//             })
//         }
//     }
// })