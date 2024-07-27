const crypto = require("crypto");
const User = require('../models/User');
const cloudinary = require('cloudinary');
const sendToken = require('../Utils/jwttoken');
const sendEmail = require('../Utils/sendEmail');
const ErrorHandler = require('../Utils/errorHandler');
const catchAsyncError = require('../middleWare/catchAsyncError');

//create a user
exports.createUser = catchAsyncError(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });
    const { name, email, password } = req.body
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });
    sendToken(user, 201, res);
});

//Login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    //checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email and Password', 400));
    }

    // use findone ,(find and match)----->email and password but use (select method) because inside user model (password: select---false)
    const user = await User.findOne({ email }).select("+password");

    // user is not found then call if statement and return next method
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    /*
    1.camparepassword method ----> campare entered password and existing password
    2.isPasswordMatched return boolean(true or false) 
    */
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    sendToken(user, 200, res);
});

//logout user 
exports.logoutUser = catchAsyncError(async (req, res, next) => {

    // token value is null in cookie after use logout function
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "logged out"
    });
});

/*
1.Forgot password
2.search user with the help of email and find email in a user body but user are not found then call if statement
3.use method(getresetpassword) and give resetpassword token then save
4.create url for reset a password and send message with url
*/
exports.forgotPassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n   ${resetPasswordUrl}  \n\nIf you have not requested this email then, please ignore it`;

    try {
        await sendEmail({ email: user.email, subject: `Ecommerce Password Recovery`, message });
        res.status(200).json({ success: true, message: `Email sent to ${user.email} successfullly` });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

/*
1.Reset Password
2.creating hash token
3.find resetpasswordtoken and resetpasswordexpire in user model and (resetpasswordexpire) must be greater than (date.now())
4.if resetpassword is not correct then call if statement
5.if new password and confirm password is not equal then call if statement 
*/
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorHandler("Reset Password token is invalid or has been expired", 404));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 404));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});

//Get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
});

//Update User password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    /*
    1.camparepassword method ----> campare old password in database
    2.isPasswordMatched return boolean(true or false) 
    3.check condition,new password and confirm password is not match then call if statement 
    4.new password and confirm password is match then save new password in database 
    */
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

//Update User Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {

    /*
    1.create new user object and update name and email in the database
    2.we will add cloudinary later
    3.use user id for update  login user
    */
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale",
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({ success: true, });
});

//Get all users--(admin)
exports.getAllUser = catchAsyncError(async (req, res, next) => {

    const users = await User.find();
    res.status(200).json({ success: true, users })
});

//Get single user---(admin) 
exports.getSingleUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`user does not exist with ID: ${req.params.id}`));
    }
    res.status(200).json({ success: true, user });
});

//Update User Role --(Admin)
exports.updateUserRole = catchAsyncError(async (req, res, next) => {

    /*
    1.create new user object 
    2.use user id for update  login user 
    3.update role in the database by admin
    */
    const newUserData = {
        role: req.body.role,
    }

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({ success: true, message: "Update role successfully" });
});

//Delete user  --(Admin)
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);
    //we will remove cloudinary later

    if (!user) {
        return next(new ErrorHandler(`User doen not exist with id: ${req.params.id}`, 400))
    }

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    await user.remove();

    res.status(200).json({ success: true, message: "User Deleted Successfully" });
});