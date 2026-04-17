
import express from "express";
import { getTxnHandler, createTxnHandler } from "../handlers/txnHandler.js";

const router = express.Router();

router.get("/txn/:id", getTxnHandler);
router.post("/txn", createTxnHandler);

export default router;
