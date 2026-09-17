import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import foodRoutes from "./routes/food.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);