import catchAsyncError from "../middleWare/catchAsyncError.js";
import Stripe from "stripe";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

//process payment method before pay amount
export const processPayment = catchAsyncError(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "Ecommerce",
        },
    });
    res.status(200).json({success: true, client_secret: myPayment.client_secret})
});

//use apikey to allow pay a amount of third party api
export const sendStripeApiKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY});
});