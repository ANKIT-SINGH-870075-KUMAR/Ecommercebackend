const express = require("express");
const { fetchAllProducts, createProduct, updateProduct, deleteProduct, detailProduct, createProductReview, getProductReviews, deleteReview, getAdminProducts } = require("../cantrollers/productCantroller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleWare/Authentication");

const router = express.Router();
// Route 1: get all the products using: GET "/api/product/fetchallproducts". 
router.get("/fetchallproducts",fetchAllProducts);

// Route 2: get all the products by admin using: GET "/api/product/admin/product". login and Admin requried
router.get("/admin/product",isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

// Route 3: create a new product using: POST "/api/product/admin/createproduct". login and Admin requried
router.post("/admin/createproduct",isAuthenticatedUser,authorizeRoles("admin"),createProduct);

// Route 4:Update an existing Product using: PUT "/api/product/admin/updateproduct/:id" . login and Admin required
router.put("/admin/updateproduct/:id",isAuthenticatedUser,authorizeRoles("admin"),updateProduct);

// Route 5:delete an existing Product using: DELETE "/api/product/admin/deleteproduct/:id" .login and Admin required
router.delete("/admin/deleteproduct/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);

// Route 6:Product details using: GET "/api/product/detailsproduct/:id". 
router.get("/detailsproduct/:id",detailProduct);

// Route 7:Product review using: PUT "/api/product/review". login requried
router.put("/review",isAuthenticatedUser,createProductReview);

// Route 8:get review for a single product using: GET "/api/product/reviews". no login requried
router.get("/reviews",getProductReviews);

// Route 9:delete review for single product using: DELETE "/api/product/reviews". login requried
router.delete("/reviews",isAuthenticatedUser,deleteReview);

module.exports = router;