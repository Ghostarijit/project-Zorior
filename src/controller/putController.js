const mongoose = require('mongoose');
const userModel = require("../model/userModel")
const bcrypt = require("bcrypt")
const aws = require("aws-sdk")
const multer = require("multer");
const { json } = require('express/lib/response');

// connect AWS
aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "Arijit/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log(data)
            //  console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}




const updateuser = async function (req, res) {

    try {
        if (req.params.userId == undefined)
            return res.status(400).send({ status: false, message: "bookId is required." });

        let userId = req.params.userId;




        let data = req.body

        let files = req.files


        const upadatedData = {}

        let { address, fname, lname, phone, email, password, } = data // destructuring

   
        // bookid Validation and reviwId validation
        let idCheck = mongoose.isValidObjectId(userId)

        if (!idCheck) return res.status(400).send({ status: false, msg: "user is not a type of objectId" })

        // user present or not
        let status = await userModel.findOne({ _id: userId },)
        if (!status) return res.status(404).send({ msg: "this user is not present" })



        if (status.isDeleted === true) return res.status(404).send({ status: false, msg: "this user is already deleted" })

        let token = req["userId"]

        //  authorization
        if (token != userId) {
            return res.status(403).send({ status: false, msg: "You are not authorized to access this data" })
        }
        if (address) {

            
            if (Object.prototype.toString.call(address) === "[object Object]") {

                if (address.shipping) {

                    // console.log(add)

                    if (Object.prototype.toString.call(address.shipping) === "[object Object]") {


                        if (!address.shipping.street || typeof address.shipping.street !== "string" || !address.shipping.street.trim().toLowerCase()) return res.status(400).send({ status: false, msg: "in address street must be present and should be string and enter a valied street" })
                        upadatedData[address.shipping.street] = address.shipping.street.trim().toLowerCase()
                        if (!address.shipping.city || typeof address.shipping.city !== "string" || !address.shipping.city.trim().toLowerCase()) return res.status(400).send({ status: false, msg: "in address city must be present and should be string" })
                        upadatedData[address.shipping.city] = address.shipping.city.trim().toLowerCase()
                        if (!address.shipping.pincode || typeof address.shipping.pincode !== "string" || !address.shipping.pincode.trim()) return res.status(400).send({ status: false, msg: "in address pincode must be present present and should be string" })
                        let pin = /^[0-9]{6}$/.test(address.shipping.pincode.trim())
                        if (!pin) return res.status(400).send({ status: false, msg: "Address pincode Only have Number and 6 number only and should be string" })
                        upadatedData[address.shipping.pincode] = address.shipping.pincode.trim()
                    } else {
                        return res.status(400).send({ status: false, msg: "shipping should be in object form" })

                    }
                }  else { return res.status(400).send({ status: false, msg: "shipping address Should be present" }) }

                // billing validation 
                if (address.billing) {

                    if (Object.prototype.toString.call(address.billing) === "[object Object]") {
                        if (!address.billing.street || typeof address.billing.street !== "string" || !address.billing.street.trim().toLowerCase()) return res.status(400).send({ status: false, msg: "in billing street must be present and should be string " })
                        address.billing.street = address.billing.street.trim().toLowerCase()
                        if (!address.billing.city || typeof address.billing.city !== "string" || !address.billing.city.trim().toLowerCase()) return res.status(400).send({ status: false, msg: "in billing city must be present and should be string" })
                        address.billing.city = address.billing.city.trim().toLowerCase()
                        if (!address.billing.pincode || typeof address.billing.pincode !== "string" || !address.billing.pincode.trim()) return res.status(400).send({ status: false, msg: "in billing pincode must be present present and should be string" })
                        let pinn = /^[0-9]{6}$/.test(address.billing.pincode.trim())
                        if (!pinn) return res.status(400).send({ status: false, msg: "billing pincode Only have Number and 6 number only and should be string" })
                        address.billing.pincode = address.billing.pincode.trim()
                    }
                    else {
                        return res.status(400).send({ status: false, msg: "billing should be in object form" })
                    }

                }

            }
            else {
                return res.status(400).send({ status: false, msg: "addresss should be in object form and present ad shipping and billing should be present in address" })
            }
        }
        if (fname) {

            if (typeof fname !== "string" || fname.trim().length === 0) return res.status(400).send({ status: false, msg: "fname should be string" });

            let nname = /^[a-zA-Z ]{2,30}$/.test(fname.trim())
            if (!nname) return res.status(400).send({ status: false, msg: "enter valid  fname" })

            data.fname = data.fname.trim()

        }
        if (lname) {


            if (typeof lname !== "string" || lname.trim().length === 0) return res.status(400).send({ status: false, msg: "lname should be string" });

            let nnname = /^[a-zA-Z ]{2,30}$/.test(fname.trim())
            if (!nnname) return res.status(400).send({ status: false, msg: "enter valid  lname" })

            data.lname = data.lname.trim()
        }

        if (phone) {

            if (typeof phone !== "string") {
                return res.status(400).send({ status: false, msg: " phone number is mandatory and should be in string datatype" });
            }
            let mob = /^[0-9]{10}$/
            if (!mob.test(phone.trim())) {
                return res.status(400).send({ status: false, msg: " phone number should have 10 digits only" });
            }
            let call = await userModel.findOne({ phone: phone.trim() })

            if (call) return res.status(400).send({ status: false, msg: "this phone is already present" })
            data.phone = data.phone.trim()
        }

        if (email) {
            if (typeof email != "string")
                return res.status(400).send({ status: false, message: "Email must be in String datatype" })
            let regx = /^([a-zA-Z0-9\._]+)@([a-zA-Z])+\.([a-z]+)(.[a-z])?$/

            let x = regx.test(email.trim())
            if (!x) {
                return res.status(400).send({ status: false, msg: "write the correct format for email" })
            }
            let mail = await userModel.findOne({ email: email.trim().toLowerCase() })

            if (mail) return res.status(400).send({ status: false, msg: "this email is already present" })
            data.email = data.email.trim().toLowerCase()
        }

        if (password) {

            if (typeof password !== "string" || password.trim().length === 0) return res.status(400).send({ status: false, msg: "enter valid password" });

            let pass = /^(?=.*\d)(?=.*[a-z])(?=.*[!@#\$%\^&\*\.])(?=.*[A-Z]).{8,200}$/.test(password.trim())

            if (!pass) return res.status(400).send({ status: false, msg: "1.At least one digit, 2.At least one lowercase character,3.At least one uppercase character,4.At least one special character, 5. At least 8 characters in length, but no more than 16" })

            const salt = await bcrypt.genSalt(10)

            let passs = await bcrypt.hash(data.password, salt)

            const updateuser = await userModel.findOneAndUpdate({ _id: userId?.trim() }, {

                $set: { password: passs }

            }, { new: true })



            // return res.status(200).send({ status: true, msg: "updated User", data: updateuser });
        }
        //let files = req.files
        if (files) {





            // let files = req.files
            // console.log(files)
            if (files && files.length > 0) {
                //upload to s3 and get the uploaded link
                // res.send the link back to frontend/postman
                let uploadedFileURL = await uploadFile(files[0])
                data.profileImage = uploadedFileURL
                let Image = data.profileImage
                // return res.status(201).send({ status: true, data: user })

                const update = await userModel.findOneAndUpdate({ _id: userId?.trim() }, {

                    $set: { profileImage: Image }

                }, { new: true })
            }

        }

        //console.log(files)

        const updateuser = await userModel.findOneAndUpdate({ _id: userId?.trim() }, {

            $set: { fname: fname, lname: lname, address: address, email: email, phone: phone, upadatedData }

        }, { new: true })//.select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })

        const user = await userModel.findById(userId)



        return res.status(200).send({ status: true, msg: "updated User", data: user });
    } catch (err) {
        // console.log(err.message)
        return res.status(500).send({ status: "error", error: err.message })
    }


}





module.exports.updateuser = updateuser

