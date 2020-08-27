const jwt = require('jsonwebtoken');
require('dotenv/config');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if(!token) return res.status(401).send("Access denied to unauthorized users.");

    try{
        const verified = jwt.verify(token, process.env.JWT_TOKEN);
        req.user = verified;
        next();
    }
    catch(err){
        res.status(400).json({error: err})
    }
}