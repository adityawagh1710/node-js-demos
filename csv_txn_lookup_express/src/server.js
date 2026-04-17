
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import txnRoutes from "./routes/txnRoutes.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { loggerMiddleware } from "./middleware/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const publicPath = path.join(__dirname, "public");

app.use(express.json());
app.use(express.static(publicPath));
app.use(requestIdMiddleware);
app.use(loggerMiddleware);

app.use("/api/v1", txnRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.use(errorHandler);

app.listen(8080, () => {
  console.log("Server running on port 8080");
});
