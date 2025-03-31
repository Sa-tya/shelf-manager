import express from 'express';
import cors from 'cors';
import subjectsRouter from './routes/subjects';
import { connectDB } from './config/db';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/subjects', subjectsRouter);

// Database connection
connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 