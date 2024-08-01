import express from "express";
import { processPayment, sendStripeApiKey } from "../cantrollers/paymentCantroller.js";
const router = express.Router();
import { isAuthenticatedUser } from "../middleWare/Authentication.js";
/*Route 1:Check Authenticate user is vaild or not before payment
 using: POST "/api/payment/process" Login requried
*/
router.post("/process", isAuthenticatedUser, processPayment);

/*Route 2:use a third party(stripe) and send a apikey to futher processed a payment process
  using: GET "api/payment/stripeapikey" login required
*/
router.get("/stripeapikey", isAuthenticatedUser, sendStripeApiKey);
export default router;