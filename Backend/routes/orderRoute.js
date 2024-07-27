const express = require("express");
const { newOrder, myOrders, getSingleOrder, getAllOrders, updateOrder, deleteOrder } = require("../cantrollers/orderCantroller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleWare/Authentication");

const router = express.Router();

// Route 1:create a new order using: POST "/api/order/newOrder".--- Login required 
router.post("/newOrder",isAuthenticatedUser,newOrder);

// Route 2:get order for logged in user using: GET "/api/order/me".--- Login required 
router.get("/me",isAuthenticatedUser, myOrders);

// Route 3:get a single order with help of order id using: GET "/api/order/:id".--- Login required 
router.get("/:id",isAuthenticatedUser,getSingleOrder);

// Route 4:get a all order show in admin panel using: GET "/api/order/admin/orders".--- Login and admin required 
router.get("/admin/orders",isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);

// Route 5:update order in admin panel using: PUT "/api/order/admin/:id".--- Login and admin required 
router.put("/admin/:id",isAuthenticatedUser,authorizeRoles("admin"),updateOrder);

// Route 6:delete order in admin panel using: DELETE "/api/order/admin/:id". -- Login and admin required
router.delete("/admin/:id",isAuthenticatedUser,authorizeRoles("admin"),deleteOrder);



module.exports = router;