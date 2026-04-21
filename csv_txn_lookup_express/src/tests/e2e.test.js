import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { GenericContainer, Wait } from "testcontainers";

let container;
let baseUrl;

beforeAll(async () => {
  container = await new GenericContainer("csv-txn-lookup")
    .withExposedPorts(8080)
    .withWaitStrategy(Wait.forHttp("/", 8080))
    .start();

  const host = container.getHost();
  const port = container.getMappedPort(8080);
  baseUrl = `http://${host}:${port}`;
}, 60_000);

afterAll(async () => {
  await container?.stop();
});

describe("E2E: GET /api/v1/txn/:id", () => {
  it("returns 200 for an existing transaction", async () => {
    const res = await fetch(`${baseUrl}/api/v1/txn/TXN100000`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ Txn: "TXN100000" });
  });

  it("returns 404 for a non-existent transaction", async () => {
    const res = await fetch(`${baseUrl}/api/v1/txn/TXNNOTFOUND`);
    expect(res.status).toBe(404);
  });
});

describe("E2E: POST /api/v1/txn", () => {
  it("returns 201 when creating a new transaction", async () => {
    const res = await fetch(`${baseUrl}/api/v1/txn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txn: "TXNE2E001", reference: "REFE2E001", mode: "UPI" }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ Txn: "TXNE2E001" });
  });

  it("returns 409 when transaction already exists", async () => {
    const res = await fetch(`${baseUrl}/api/v1/txn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txn: "TXNE2E001", reference: "REFE2E001", mode: "UPI" }),
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await fetch(`${baseUrl}/api/v1/txn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txn: "TXNE2E002" }),
    });
    expect(res.status).toBe(400);
  });
});
