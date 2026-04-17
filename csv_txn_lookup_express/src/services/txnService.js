
import { getCSVFiles, searchTxnParallel, appendTxn } from "../loader/search.js";

export const lookupTxn = async (txnId) => {
  const files = await getCSVFiles("../data");
  return await searchTxnParallel(files, txnId);
};

export const createTxn = async (record) => {
  const { Txn, Reference, Mode } = record;
  if (!Txn || !Reference || !Mode) {
    throw new Error("Missing transaction fields");
  }

  const existing = await lookupTxn(Txn);
  if (existing) {
    throw new Error("Transaction already exists");
  }

  return await appendTxn({ Txn, Reference, Mode });
};
