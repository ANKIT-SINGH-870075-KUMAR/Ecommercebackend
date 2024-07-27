const express = require('express');
const { createUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require('../cantrollers/userCantroller');
const { isAuthenticatedUser, authorizeRoles } = require("../middleWare/Authentication");
const router = express.Router();
//Route1: Create a User using:  POST "/api/auth/createuser" .no login required
router.post("/createuser",createUser);

//Route2: Authenticate a User using:  POST "/api/auth/login" . No login required
router.post("/login",loginUser);

//Route 3: forgot password using: POST "/api/auth/password/forgot". No login required
router.post("/password/forgot",forgotPassword);

//Route 4: reset password using: PUT "/api/auth/password/reset/:token". No login required
router.put("/password/reset/:token",resetPassword);

//Route 5: user logout for Account using: GET "/api/auth/logout". login required
router.get("/logout",logoutUser);

//Route 6: get loggedin user Details using: POST "/api/auth/me". login required
router.get("/me",isAuthenticatedUser,getUserDetails);

//Route 7: update password for loggedin user using: PUT "/api/auth/password/update". login required
router.put("/password/update",isAuthenticatedUser,updatePassword);

//Route 8: update profile for loggedin user using: PUT "/api/auth/me/update". login required
router.put("/me/update",isAuthenticatedUser,updateProfile);

//Route 9: admin check loggedin user using: GET "/api/auth/admin/users". login and admin required
router.get("/admin/users",isAuthenticatedUser,authorizeRoles("admin"),getAllUser);

//Route 10: admin check loggedin user details using: GET "/api/auth/admin/user/:id". login and admin required
router.get("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),getSingleUser);

//Route 11: admin update loggedin user Role using: PUT "/api/auth/admin/user/:id". login and admin required
router.put("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),updateUserRole);

//Route 12: admin Delete loggedin user using: DELETE "/api/auth/admin/user/:id". login and admin required
router.delete("/admin/user/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteUser);

module.exports = router;