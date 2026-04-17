
import { v4 as uuid } from "uuid";

export const requestIdMiddleware = (req, res, next) => {
  req.requestId = uuid();
  next();
};
