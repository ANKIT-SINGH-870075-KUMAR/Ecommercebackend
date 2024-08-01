import crypto from 'crypto';
import {User} from '../models/User.js';
import cloudinary from 'cloudinary';
import sendToken from '../Utils/jwttoken.js';
import sendEmail from '../Utils/sendEmail.js';
import ErrorHandler from '../Utils/errorHandler.js';
import catchAsyncError from '../middleWare/catchAsyncError.js';

// Create a user
export const createUser = catchAsyncError(async (req, res, next) => {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });
    sendToken(user, 201, res);
});

// Login user
export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // Checking if user has given password and email both
    if (!email || !password) {
        return next(new ErrorHandler('Please Enter Email and Password', 400));
    }

    // Use findOne ,(find and match)----->email and password but use (select method) because inside user model (password: select---false)
    const user = await User.findOne({ email }).select("+password");

    // User is not found then call if statement and return next method
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Compare entered password and existing password
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    sendToken(user, 200, res);
});

// Logout user 
export const logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Logged out"
    });
});

// Forgot password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
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
        res.status(200).json({ success: true, message: `Email sent to ${user.email} successfully` });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
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

// Get User Details
export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user,
    });
});

// Update User password
export const updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

// Update User Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
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

    res.status(200).json({ success: true });
});

// Get all users--(admin)
export const getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({ success: true, users });
});

// Get single user---(admin)
export const getSingleUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not exist with ID: ${req.params.id}`));
    }
    res.status(200).json({ success: true, user });
});

// Update User Role --(Admin)
export const updateUserRole = catchAsyncError(async (req, res, next) => {
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

// Delete user  --(Admin)
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not exist with ID: ${req.params.id}`, 400));
    }

    const imageId = user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    await user.remove();

    res.status(200).json({ success: true, message: "User Deleted Successfully" });
});
