import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Import Routes
import authRoute from "./src/route/authRoute.js";
import userRoute from "./src/route/userRoute.js";
import lessonRoute from "./src/route/lessonRoute.js";
import materialRoute from "./src/route/materialRoute.js";
import activityRoute from "./src/route/activityRoute.js";
import assessmentRoute from "./src/route/assessmentRoute.js"; // keep naming consistent
import lessonProgressRoutes from "./src/route/lessonProgressRoute.js";
import contactRoute from "./src/route/contactRoute.js";
import aiRoute from "./src/route/aiRoute.js"

// ✅ Use Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/lessons", lessonRoute);
app.use("/api/materials", materialRoute);
app.use("/api/activities", activityRoute);
app.use("/api/assessments", assessmentRoute);
app.use("/api/progress", lessonProgressRoutes);
app.use("/api/contact", contactRoute);
app.use("/api/ai", aiRoute);


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    // Mongoose 6+ no longer requires these options
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
