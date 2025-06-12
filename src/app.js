import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

app.use(express.static("public"));

app.use(cookieParser());
//import routes
import healthCheckRouter from "./routes/healthCheck.routes.js";

//routes
app.use("/api/v1/healthcheck", healthCheckRouter);
export { app };
