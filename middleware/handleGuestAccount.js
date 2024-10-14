// guestMiddleware.js
const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
// Middleware to create or retrieve a guest user
const handleGuestAccount = async (req, res, next) => {
    if(req.cookies.token){
        return next();
    } 
    let guestId = req.cookies.guestId;
    if (!guestId) {
        const guestUser = new User({
            role: 'guest',
            isGuest: true
        });
        await guestUser.save();
        guestId = guestUser.guestId;
        // const token =  jwt.sign({
        //     id: guestId,   
        // }, process.env.SECRET, {
        //     expiresIn: process.env.JWT_EXPIRE,
        // })
        // Set guestId in cookie
        // res.cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000) }); // 1 day
        res.cookie('guestId', guestId, { 
            httpOnly: true, 
            expires: new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRE, 10) * 24 * 60 * 60 * 1000) // Convert days to milliseconds
        });
    }

    // Attach guest user to request
    req.guestId = guestId;
    next();

};

module.exports = handleGuestAccount;
