const jwt = require("jsonwebtoken");



const validateToken = async function (req, res, next) {
    try {
        // token came from response Hader
        let token = req.header('Authorization','Bearer Token')
        // if the token present or not in response header
        if (!token) {
            return res.status(401).send({ status: false, msg: "token must be present" });
        }

        let splitToken = token.split(" ")

        console.log(splitToken)
        // we save this token with variable because decoded userId in then Token
        let decodedToken = jwt.decode(splitToken[1],"Zorior")
        if (!decodedToken) {
            return res.status(401).send({ status: false, msg: "inavlid token" })
        }
       // console.log(decodedToken)

        let tokenValidate = jwt.verify(splitToken[1], "Zorior")

        if(!tokenValidate)   return res.status(400).send({ status: false, msg: "Invalied Authentication" })
        // we create the  userId with the help of decodedToken and set in request userId
        req["userId"] = decodedToken.userId
       // console.log(req["userId"])
        // next function go to the next handler
        next()

    } catch (erre) {
        return res.status(500).send({ status: "Error", error: erre.message })

    }
}
module.exports.validateToken = validateToken