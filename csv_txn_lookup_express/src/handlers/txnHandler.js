
import { lookupTxn, createTxn } from "../services/txnService.js";

export const getTxnHandler = async (req, res, next) => {
  try {
    const txn = await lookupTxn(req.params.id);

    if (!txn) {
      return res.status(404).json({ error: "txn not found" });
    }

    res.json(txn);
  } catch (err) {
    next(err);
  }
};

export const createTxnHandler = async (req, res, next) => {
  try {
    const { txn, reference, mode } = req.body;
    const created = await createTxn({ Txn: txn?.trim(), Reference: reference?.trim(), Mode: mode?.trim() });
    res.status(201).json(created);
  } catch (err) {
    if (err.message === "Transaction already exists") {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === "Missing transaction fields") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};
