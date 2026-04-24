import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import logger from "./config/logger";
const PORT = process.env.PORT || 5000;

connectDB();

logger.info("Starting server...");

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
