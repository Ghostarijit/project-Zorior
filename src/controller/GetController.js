const mongoose = require('mongoose');
const userModel = require("../model/userModel")






const getUserById = async function (req, res) {
    try {
        if (req.params.userId == undefined)
            return res.status(400).send({ status: false, message: "userId is required." });
        let userId = req.params.userId

        if (userId) {
            if (!mongoose.isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: "userId is not a type of objectId" })
            }
        }
        let check = await userModel.findOne({ _id: userId }).select()
        if (!check) {
            return res.status(400).send({ status: false, msg: "userId is not present or Already deleted" })
        }
        if (check.length === 0) {
            return res.status(404).send({ status: false, msg: "user not found" })
        }

        

        const user = await userModel.findById(userId).select({ address: 1, _id: 1, fname: 1, lname: 1, email: 1, profileImage: 1, phone: 1, password: 1, createdAt: 1, updatedAt: 1 })

     
        return res.status(200).send({ status: true, message: "User Ditles", data: user })

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ status: "error", error: err.message })
    }
}




module.exports.getUserById = getUserById



