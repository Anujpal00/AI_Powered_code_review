const express = require('express')
const app = express();
const aiRoutes = require('./routes/ai.route');
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth.route');
const historyRoutes = require('./routes/history.route');

app.use(cors())

app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello World')
})


app.use('/ai',aiRoutes)
app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

module.exports = app;