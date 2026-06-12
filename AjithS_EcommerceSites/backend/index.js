// Architect: SP
const express = require('express');
const chalk = require('chalk');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./utils/database/mongoConfig');
const fetch = require('node-fetch'); // Only needed if Node < 18

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const hasValidOpenAIKey = OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_KEY_HERE' && OPENAI_API_KEY.trim() !== '';
if (!hasValidOpenAIKey) {
    console.warn(chalk.yellow('⚠️  OPENAI_API_KEY is not set or is a placeholder. OpenAI image fallback is disabled.'));
}

const escapeSvgText = (text) =>
    String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const createPromptPlaceholder = (prompt) => {
    const escaped = escapeSvgText(prompt);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f4f1de" />
      <stop offset="100%" stop-color="#e07a5f" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)" />
  <rect x="64" y="64" width="896" height="896" rx="48" fill="rgba(255,255,255,0.55)" />
  <text x="512" y="240" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" fill="#2a2d34">AI Preview</text>
  <text x="512" y="340" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#2a2d34">Your design will appear here</text>
  <foreignObject x="120" y="420" width="784" height="460">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial, Helvetica, sans-serif; font-size:28px; color:#2a2d34; line-height:1.4;">
      <p><strong>Prompt</strong></p>
      <p style="white-space:pre-wrap;">${escaped}</p>
    </div>
  </foreignObject>
</svg>`;
};

// Create Express app
const app = express();

// Print welcome message
console.log(chalk.cyan('\n🚀 Initializing RBLA5 Backend Server...'));

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
    origin: (origin, cb) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================= ROUTES IMPORT =======================
const productRoutes = require('./routes/productRoutes');
const superadminRoutes = require('./routes/superadmin');
const superadminAuthRoutes = require('./routes/superadminauthroutes');
const superadminProductRoutes = require('./routes/superadmin/productRoutes');
const superadminCategoryRoutes = require('./routes/superadmin/categoryRoutes');
const superadminUploadRoutes = require('./routes/superadmin/uploadRoutes');
const superadminOrderRoutes = require('./routes/superadmin/orderRoutes');
const superadminPaymentRoutes = require('./routes/superadmin/paymentRoutes');
const superadminReviewRoutes = require('./routes/superadmin/reviewRoutes');
const superadminSalesReportRoutes = require('./routes/superadmin/salesReportRoutes');
const superadminWorkerRoutes = require('./routes/superadmin/workerRoutes');
const superadminUserRoutes = require('./routes/superadmin/users');
const superadminStoreRoutes = require('./routes/superadmin/storeRoutes');
const customerRoutes = require('./routes/superadmin/customerRoutes');
const adminRoutes = require('./routes/superadmin/admins');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminProductRoutes = require('./routes/admin/productRoutes');
const adminCategoryRoutes = require('./routes/admin/categoryRoutes');
const adminUploadRoutes = require('./routes/admin/uploadRoutes');
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const adminPaymentRoutes = require('./routes/admin/paymentRoutes');
const adminReviewRoutes = require('./routes/admin/reviewRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const adminSalesRoutes = require('./routes/admin/salesRoutes');
const adminWorkerRoutes = require('./routes/admin/workerRoutes');
const publicProductRoutes = require('./routes/public/productRoutes');
const publicGeneralRoutes = require('./routes/public/generalRoutes');
const publicRoutes = require('./routes/public/index');
const userAuthRoutes = require('./routes/user/auth');
const userProfileRoutes = require('./routes/user/profileRoutes');
const userCartRoutes = require('./routes/user/cartRoutes');
const userWishlistRoutes = require('./routes/user/wishlistRoutes');
const userOrderRoutes = require('./routes/user/orderRoutes');
const userBraintreeRoutes = require('./routes/user/braintreeRoutes');
const userReviewRoutes = require('./routes/user/reviewRoutes');

// ======================= ROUTE MOUNTS =======================

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the NGO Products API!');
});

// API Routes
app.use('/api/products', productRoutes);

// Superadmin routes
app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/auth', superadminAuthRoutes);
app.use('/api/superadmin/products', superadminProductRoutes);
app.use('/api/superadmin/categories', superadminCategoryRoutes);
app.use('/api/superadmin/upload', superadminUploadRoutes);
app.use('/api/superadmin/orders', superadminOrderRoutes);
app.use('/api/superadmin/payments', superadminPaymentRoutes);
app.use('/api/superadmin/reviews', superadminReviewRoutes);
app.use('/api/superadmin/sales', superadminSalesReportRoutes);
app.use('/api/superadmin/workers', superadminWorkerRoutes);
app.use('/api/superadmin/users', superadminUserRoutes);
app.use('/api/superadmin/stores', superadminStoreRoutes);
app.use('/api/superadmin/customers', customerRoutes);
app.use('/api/superadmin/admins', adminRoutes);

// Admin routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/sales', adminSalesRoutes);
app.use('/api/admin/workers', adminWorkerRoutes);

// Public routes
app.use('/api/public/products', publicProductRoutes);
app.use('/api/public/general', publicGeneralRoutes);
app.use('/api/public', publicRoutes);

// User routes
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/cart', userCartRoutes);
app.use('/api/user/wishlist', userWishlistRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/user/braintree', userBraintreeRoutes);
app.use('/api/user/reviews', userReviewRoutes);

// ======================= AI CHATBOT ENDPOINT =======================
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

const getFallbackChatbotReply = (message) => {
    const text = (message || "").toLowerCase();

    if (text.includes("enterprises1")) {
        return "Enterprises1 offers handcrafted, sustainable product units built around local artisan skills and social enterprise support.";
    }
    if (text.includes("enterprises2")) {
        return "Enterprises2 focuses on home decor and textile products made by trained artisans using traditional techniques.";
    }
    if (text.includes("enterprises3")) {
        return "Enterprises3 provides a curated range of lifestyle products, stationery, and accessories from the RBLA network.";
    }
    if (text.includes("product")) {
        return "This site supports handcrafted RBLA products across multiple units, featuring textiles, home goods, and sustainable artisan-made items.";
    }
    if (text.includes("order") || text.includes("shipping") || text.includes("payment")) {
        return "For order, shipping, or payment questions, please use the site’s order support or contact options. I can help explain product categories and offerings.";
    }
    return "I can help answer questions about RBLA product units, handcrafted goods, and enterprise services. Ask me about Enterprises1, Enterprises2, or Enterprises3.";
};

app.post("/api/chatbot", async (req, res) => {
    try {
        const { message } = req.body;

        if (!hasValidOpenAIKey) {
            const fallbackReply = getFallbackChatbotReply(message);
            return res.json({ reply: fallbackReply });
        }

        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant for the RBLA product site. Answer questions about products, services, and enterprise units such as Enterprises1, Enterprises2, and Enterprises3."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Chatbot failed to respond" });
    }
});

const pollinationsProxy = require('./routes/pollinationsProxy');
app.use('/api/ai', pollinationsProxy);

// ======================= UNIFIED PRODUCT CUSTOMIZER ENDPOINTS =======================
const Design = require('./models/Design');
const axios = require('axios');
const fs = require('fs');

// Image CORS Proxy Endpoint
app.get('/api/proxy', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'image/png';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(response.data);
    } catch (error) {
        console.error('CORS Proxy failed:', error.message);
        res.status(500).json({ error: 'Proxy failed to load image', details: error.message });
    }
});

// AI Text-to-Image Generation (Pollinations Proxy)
app.post('/ai/generate', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    try {
        console.log('Generating image for prompt:', prompt);
        const polUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt.trim())}`;
        const response = await axios.get(polUrl, { responseType: 'arraybuffer' });
        const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;
        res.json({ image: base64Image });
    } catch (error) {
        console.error('AI text-to-image failed:', error.message, 'status:', error.response?.status);
        // If Pollinations fails for any reason, attempt a fallback using OpenAI Images API
        // when an API key is available.
        if (hasValidOpenAIKey) {
            try {
                console.log('Using OpenAI fallback for image generation');
                const openaiResp = await axios.post(
                    'https://api.openai.com/v1/images/generations',
                    {
                        model: 'gpt-image-1',
                        prompt: prompt,
                        size: '1024x1024'
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${OPENAI_API_KEY}`,
                        },
                        responseType: 'json'
                    }
                );

                if (openaiResp.data && openaiResp.data.data && openaiResp.data.data[0]) {
                    const imgObj = openaiResp.data.data[0];
                    if (imgObj.b64_json) {
                        const dataUri = `data:image/png;base64,${imgObj.b64_json}`;
                        return res.json({ image: dataUri });
                    }
                    if (imgObj.url) {
                        const imgBytes = await axios.get(imgObj.url, { responseType: 'arraybuffer' });
                        const dataUri = `data:image/png;base64,${Buffer.from(imgBytes.data).toString('base64')}`;
                        return res.json({ image: dataUri });
                    }
                }

                return res.status(500).json({ error: 'OpenAI did not return an image', detail: openaiResp.data });
            } catch (openaiErr) {
                console.error('OpenAI fallback failed:', openaiErr?.response?.data || openaiErr.message);
            }
        }

        const placeholder = createPromptPlaceholder(prompt);
        const dataUri = `data:image/svg+xml;base64,${Buffer.from(placeholder).toString('base64')}`;
        return res.json({
            image: dataUri,
            warning: 'Using a placeholder preview because AI image generation is unavailable.',
        });
    }
});

// Save Design (Preethi format)
app.post('/design/save', async (req, res) => {
    try {
        const design = new Design(req.body);
        const saved = await design.save();
        res.json(saved);
    } catch (err) {
        console.error('Save design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Save Design (Abirami format / compatibility)
app.post('/designs', async (req, res) => {
    try {
        const { title, description, imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Save image to disk locally under uploads/custom-designs
        const uploadsDir = path.join(__dirname, 'uploads', 'custom-designs');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const base64Data = imageBase64.replace(/^data:image\/png;base64,/, '').replace(/\s/g, '');
        const filename = `design-${Date.now()}.png`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, base64Data, 'base64');

        const newDesign = new Design({
            title: title || 'napkin',
            description: description || 'Custom napkin design',
            fileUrl: `/uploads/custom-designs/${filename}`,
            image: imageBase64,
            type: title || 'napkin'
        });

        await newDesign.save();
        res.json({ message: '✅ Design saved successfully', design: newDesign });
    } catch (err) {
        console.error('Save design compatibility error:', err.message);
        res.status(500).json({ message: 'Failed to save design', error: err.message });
    }
});

// Retrieve Designs
app.get('/designs', async (req, res) => {
    try {
        const filter = {};
        if (req.query.type) {
            filter.type = req.query.type;
        }
        const designs = await Design.find(filter).sort({ createdAt: -1 });
        res.json(designs);
    } catch (err) {
        console.error('Fetch designs error:', err.message);
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
});

// Delete Design
app.post('/design/delete', async (req, res) => {
    try {
        const { id } = req.body;
        const deleted = await Design.findByIdAndDelete(id);
        if (deleted) {
            res.json({ success: true, deleted: true });
        } else {
            res.json({ success: false, deleted: false });
        }
    } catch (err) {
        console.error('Delete design error:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// ======================= GLOBAL ERROR HANDLER =======================
app.use((err, req, res, next) => {
    console.error(chalk.red('❌ Error:'), err);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({ status: 'error', message: errors.join(', ') });
    }

    if (err.code === 11000) {
        return res.status(400).json({ status: 'error', message: 'Duplicate field value entered' });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ status: 'error', message: 'Your token has expired. Please log in again.' });
    }

    res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal server error' });
});

// ======================= SERVER START =======================
async function startServer() {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            const serverArt = `
🌟 ${chalk.green('✓')} RBLA5 Server Started Successfully ${chalk.green('✓')} 🌟
===============================================
${chalk.cyan('🌐 Environment:')} ${chalk.yellow(process.env.NODE_ENV || 'development')}
${chalk.cyan('🚪 Port:')} ${chalk.green(PORT)}
${chalk.cyan('🔗 URL:')} ${chalk.green(`http://localhost:${PORT}`)}
${chalk.cyan('📡 Status:')} ${chalk.green('Online ✓')}
===============================================
`;
            console.log(serverArt);
            console.log(chalk.green('✨ Server initialization complete!'));
            console.log(chalk.yellow('💡 Ready to handle requests\n'));
        });
    } catch (error) {
        console.error(chalk.red('\n❌ Failed to start server:'), error);
        process.exit(1);
    }
}

startServer();
