const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
require('dotenv').config();
const solutionRoutes = require("./routes/solutionRoutes");

const authRoutes=require('./routes/authRoutes');
const taskRoutes=require('./routes/taskRoutes');
const govRoutes = require('./routes/govRoutes');
const app=express();
const collaborationRoutes = require('./routes/collaborationRoutes');

// Mount routes

// Place BEFORE your app.use('/api/...', ...) routes

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173', // Local Vite dev server
  'http://localhost:3000', // Local CRA dev server (if applicable)
  'https://repository-name-sih-jharkhand-innov-eight.vercel.app', // Vercel deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman, or local file loads)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(
          new Error(`CORS policy violation: ${origin} is not allowed`)
        );
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/collaborations', collaborationRoutes);

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 8000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.error('👉 Fix: Go to MongoDB Atlas → Network Access → Add IP Address → Allow 0.0.0.0/0');
  // Server stays alive — requests will fail gracefully until Mongo is reachable
});

app.use('/api/auth',authRoutes);
app.use('/api/tasks',taskRoutes);
app.use("/api/solutions", solutionRoutes);
app.use('/api/gov', govRoutes);
const PORT=process.env.PORT||5000;

app.listen(PORT,()=>console.log(`server is running on port :${PORT}`))