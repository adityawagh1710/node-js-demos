import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookupTxn, createTxn } from "../services/txnService.js";
import * as search from "../loader/search.js";

vi.mock("../loader/search.js");

beforeEach(() => vi.clearAllMocks());

describe("lookupTxn", () => {
  it("returns a transaction when found", async () => {
    search.getCSVFiles.mockResolvedValue(["file1.csv"]);
    search.searchTxnParallel.mockResolvedValue({ Txn: "TXN001", Reference: "REF1", Mode: "UPI" });

    const result = await lookupTxn("TXN001");
    expect(result).toMatchObject({ Txn: "TXN001" });
  });

  it("returns null when not found", async () => {
    search.getCSVFiles.mockResolvedValue(["file1.csv"]);
    search.searchTxnParallel.mockResolvedValue(null);

    const result = await lookupTxn("MISSING");
    expect(result).toBeNull();
  });
});

describe("createTxn", () => {
  it("creates a transaction successfully", async () => {
    search.getCSVFiles.mockResolvedValue([]);
    search.searchTxnParallel.mockResolvedValue(null);
    search.appendTxn.mockResolvedValue({ Txn: "TXN999", Reference: "REF9", Mode: "CARD" });

    const result = await createTxn({ Txn: "TXN999", Reference: "REF9", Mode: "CARD" });
    expect(result).toMatchObject({ Txn: "TXN999" });
  });

  it("throws if fields are missing", async () => {
    await expect(createTxn({ Txn: "TXN999" })).rejects.toThrow("Missing transaction fields");
  });

  it("throws if transaction already exists", async () => {
    search.getCSVFiles.mockResolvedValue(["file1.csv"]);
    search.searchTxnParallel.mockResolvedValue({ Txn: "TXN001" });

    await expect(createTxn({ Txn: "TXN001", Reference: "REF1", Mode: "UPI" })).rejects.toThrow(
      "Transaction already exists"
    );
  });
});
