const express = require('express');
const dotenv = require('dotenv');
const user = require('./router/user.route');
const admin = require('./router/admin.router');
const event = require('./router/event.router');
const product = require('./router/product.route');
const blog = require('./router/blog.router');
const contactUs = require('./router/contactUs.router');
const server = require('./database/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const path = require('path');
const errorMiddleware = require('./middleware/error');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();

/////////// rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

  

// Load environment variables
dotenv.config({ path: 'config/config.env' });

// Middleware setup
app.use('/profile', express.static(path.join(__dirname, '/profile')));
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(helmet());
app.use(limiter);
app.use(compression());
app.use(fileUpload());  

// // Session setup
// app.use(session({
//     store: new MongoStore({ mongoUrl: process.env.MONGO_URI }),
//     secret: 'cats', // Replace with a strong and secure session secret
//     resave: false,
//     saveUninitialized: false,
//     cookie: false
// }));

// Routes setup
app.use(user);
app.use('/admin/', admin);
app.use(product);
app.use(blog);
app.use(contactUs);
app.use(event);
app.use(errorMiddleware);

app.get('/api/getkey', (req, res) => {
    res.json({ key: process.env.RAZORPAY_API_KEY });
});



// Database connection
server().then(() => {
    console.log("Database Connected Successfully");
}).catch(err => {
    console.error("Database Connection Error:", err);
});

// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
