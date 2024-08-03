import cookieParser from 'cookie-parser';
import express from 'express';
import errorMiddleware from './middleWare/error.js';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/productRoute.js';
import orderRoutes from './routes/orderRoute.js';
import paymentRoutes from './routes/paymentRoute.js';

// Config
dotenv.config({ path: 'backend/config/config.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({
    // origin: 'https://darling-gumption-2d499a.netlify.app/',  // Replace with your frontend domain
    // credentials: true,  // Allow credentials to be sent
}));


// Available Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Middleware for Errors
app.use(errorMiddleware);

export default app;
