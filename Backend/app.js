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
import path from 'path';  // Make sure to import path
import { fileURLToPath } from 'url';  // Required for __dirname with ES modules

// Config
dotenv.config({ path: 'backend/config/config.env' });

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Available Routes
app.use('/api/auth', authRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

// Middleware for Errors
app.use(errorMiddleware);

export default app;
