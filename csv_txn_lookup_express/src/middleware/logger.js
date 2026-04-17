
import pino from "pino";

const logger = pino();

export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info({
      method: req.method,
      path: req.url,
      status: res.statusCode,
      latency: Date.now() - start,
      request_id: req.requestId
    });
  });

  next();
};
