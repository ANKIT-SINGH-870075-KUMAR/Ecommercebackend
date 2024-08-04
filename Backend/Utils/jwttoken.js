// Import necessary modules
const sendToken = (user, statuscode, res) => {
    // Generate a token using the user's method
    const token = user.getJWTToken();

    // Options for setting the cookie
    const options = {
        httpOnly: true,  // Ensures cookie is only accessible via web server
        expires: new Date(  // Cookie expiration date
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000  // Convert days to milliseconds
        ),
        secure: true, // Use secure cookies in production (HTTPS)
        // domain: '.onrender.com'  // Helps prevent CSRF attacks
    };

    // Respond with status code, cookie, and JSON data
    res.status(statuscode)
        .cookie("token", token, options)  // Set the cookie in the response
        .json({
            success: true,
            user,
            token
        });
    // **Store token in localStorage (browser environment only)**
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('token', token);
            console.log('Token stored in localStorage successfully.'); // Optional logging
        } catch (error) {
            console.error('Error storing token in localStorage:', error);
            // Handle localStorage storage errors gracefully, e.g., alert user or send to server logs
        }
    }
};

// module.exports = sendToken;
export default sendToken;
