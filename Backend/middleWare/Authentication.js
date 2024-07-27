const ErrorHandler = require('../Utils/errorHandler');
const catchAsyncError = require('./catchAsyncError');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    /*
    1. get token from cookie 
    2. {token} --> only get token but not get a object
    3. check token is exist(true) or undefine(false)
    4. verify signature of admin in the token after login this process will be proceed and then user information give as a output
    */ 
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }

    const decodedData = jwt.verify(token, process.env.SECRET);

    req.user = await User.findById(decodedData.id);

    next();
});

exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {

            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this  resource`, 403));
        }

        next();
    };
};