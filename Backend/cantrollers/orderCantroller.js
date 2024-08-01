import {Order} from '../models/Order.js';
import Product from '../models/Product.js';
import ErrorHandler from '../Utils/errorHandler.js';
import catchAsyncError from '../middleWare/catchAsyncError.js';

//Create new Order --Login Requried
export const newOrder = catchAsyncError(async (req, res, next) => {

  /*
  1. using destructing alogrthium fetch some parameter form req.bpody 
  2. create oder using some parameter from (Order model) and only logged in user requried
  */
  const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body
  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single Order
export const getSingleOrder = catchAsyncError(async (req, res, next) => {

  /*
  1.find order with the help of order id and use populate method to get user name and user email with the help of user id
  */
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

//get logged in user Orders  
export const myOrders = catchAsyncError(async (req, res, next) => {

  /*
  1.find order with the help of logged in user 
  */
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all Orders --- Admin  
export const getAllOrders = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach(order => {
    totalAmount += order.totalPrice
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

//update Order Status --- Admin  
export const updateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (order) => {
      await updateStock(order.product, order.quantity);
    });
  }

  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

//create a function to update stock after order status is shipped
async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
};

//delete Order --- Admin  
export const deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});