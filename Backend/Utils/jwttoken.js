//creating token and saving in cookie
const sendToken = (user, statuscode, res) => {
    const token = user.getJWTToken();
    //options for cookie
    const options = {
        httpOnly: true,
        expries: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 3600 * 1000
        )
    }
    res.status(statuscode).cookie("token", token, options).json({ success: true, user, token });
}

module.exports = sendToken;