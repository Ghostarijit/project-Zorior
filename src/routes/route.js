const express = require('express');
const router = express.Router();


const loginController = require("../controller/loginController")
const middleWare = require("../middleWare/auth")
const put = require("../controller/putController")
const user = require("../controller/userController")
const get = require("../controller/GetController")





// User APIs
router.post("/register", user.createuser)// 1

router.post("/login", loginController.loginUser)// 2

router.put("/user/:userId/profile", middleWare.validateToken, put.updateuser)// 3

router.get("/user/:userId/profile", get.getUserById)// 4










module.exports = router;