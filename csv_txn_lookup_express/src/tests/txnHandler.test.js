import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import txnRoutes from "../routes/txnRoutes.js";
import { errorHandler } from "../middleware/errorHandler.js";
import * as txnService from "../services/txnService.js";

vi.mock("../services/txnService.js");

const app = express();
app.use(express.json());
app.use("/api/v1", txnRoutes);
app.use(errorHandler);

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/txn/:id", () => {
  it("returns 200 with transaction data when found", async () => {
    txnService.lookupTxn.mockResolvedValue({ Txn: "TXN001", Reference: "REF1", Mode: "UPI" });

    const res = await request(app).get("/api/v1/txn/TXN001");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ Txn: "TXN001" });
  });

  it("returns 404 when transaction not found", async () => {
    txnService.lookupTxn.mockResolvedValue(null);

    const res = await request(app).get("/api/v1/txn/MISSING");
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "txn not found" });
  });
});

describe("POST /api/v1/txn", () => {
  it("returns 201 on successful creation", async () => {
    txnService.createTxn.mockResolvedValue({ Txn: "TXN999", Reference: "REF9", Mode: "CARD" });

    const res = await request(app)
      .post("/api/v1/txn")
      .send({ txn: "TXN999", reference: "REF9", mode: "CARD" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ Txn: "TXN999" });
  });

  it("returns 409 when transaction already exists", async () => {
    txnService.createTxn.mockRejectedValue(new Error("Transaction already exists"));

    const res = await request(app)
      .post("/api/v1/txn")
      .send({ txn: "TXN001", reference: "REF1", mode: "UPI" });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ error: "Transaction already exists" });
  });

  it("returns 400 when fields are missing", async () => {
    txnService.createTxn.mockRejectedValue(new Error("Missing transaction fields"));

    const res = await request(app)
      .post("/api/v1/txn")
      .send({ txn: "TXN001" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Missing transaction fields" });
  });
});
