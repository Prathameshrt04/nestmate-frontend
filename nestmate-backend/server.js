const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const flatRoutes = require('./routes/flatRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messRoutes = require('./routes/messRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const productRoutes = require('./routes/productRoutes'); 
dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://192.168.29.60:5173','http://172.16.67.51:5173','http://192.168.23.206:5173','http://10.127.98.51:5173','https://nestmate-black.vercel.app','https://nestmate.in','nestmate.in'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/flats', flatRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messes', messRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/admin', adminRoutes); // Added
app.use('/api/products', productRoutes); // Added

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));