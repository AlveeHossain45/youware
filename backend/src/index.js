// --- Core Node.js and Express Setup ---
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// --- Route Imports ---
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const classRoutes = require('./routes/class.routes');
const examRoutes = require('./routes/exam.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const noticeRoutes = require('./routes/notice.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const financeRoutes = require('./routes/finance.routes');
const academicRoutes = require('./routes/academic.routes');
const reportRoutes = require('./routes/report.routes');
const settingsRoutes = require('./routes/settings.routes');

// --- Middleware Imports ---
const { errorHandler } = require('./middleware/error.middleware');

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Global Middleware ---

// 1. Enable CORS (Cross-Origin Resource Sharing)
// In production, you should restrict this to your frontend's domain for security.
// Example: app.use(cors({ origin: 'https://yourapp.com' }));
const whitelist = [
    'http://localhost:5173', // Your frontend development URL
    'https://youware-sandy.vercel.app' // Your frontend PRODUCTION URL
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));


// 2. Set security-related HTTP headers
app.use(helmet());

// 3. Enable JSON body parsing for incoming requests
app.use(express.json());
app.set('trust proxy', 1); 

// 4. Rate limiting to prevent brute-force and DDoS attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter); // Apply rate limiting to all API routes

// --- API Routes Mounting ---

// Health check endpoint
app.get('/api', (req, res) => {
    res.send('EduVersePro API is healthy and running!');
});

// Mount all feature routes under the /api path
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);

// --- Global Error Handling ---
// This MUST be the last middleware in the chain.
app.use(errorHandler);

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});  
module.exports = app;