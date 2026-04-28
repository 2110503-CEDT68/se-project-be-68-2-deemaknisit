const { setServers } = require("node:dns/promises");
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./config/swagger');


// Routes
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/provider');
const carRoutes = require('./routes/car');
const bookingRoutes = require('./routes/booking');
const reviewRoutes = require('./routes/review');
const wishlistRoutes = require('./routes/wishlist');

setServers(["1.1.1.1", "8.8.8.8"]);               // Set DNS servers
dotenv.config({ path: './config/config.env' });   // Load env vars
connectDB();                                      // Connect to database

//Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000
});

const app = express();

// Middleware
app.set('query parser', 'extended');              // Parse query strings as objects
app.use(express.json());                          // JSON Parsing
app.use(cors());                                  // CORS for frontend requests
// Swagger UI must be mounted before helmet CSP headers to avoid a blank page in production
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());                                // Security Headers 
app.use(mongoSanitize());                         // Sanitize data

// Custom XSS Sanitizer Middleware
const sanitize = (obj) => {
    if (typeof obj === 'string') return xss(obj);
    if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
            obj[key] = sanitize(obj[key]);
        });
    }
    return obj;
};

app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
});

app.use(limiter);                                 // Rate Limiting
app.use(hpp());                                   // Prevent parameter pollution
app.use(cookieParser());                          // Cookie parser

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
})
