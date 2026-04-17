# CSV Transaction Lookup (Express)

A small Node.js + Express demo for searching transaction records across CSV files and adding new transactions. The app exposes a REST API and a simple browser UI for lookup and insertion.

## Features

- Search by transaction ID across all CSV files in `src/data`
- Add new transactions to `src/data/added_txns.csv`
- Static frontend served from `src/public`
- Request logging and error handling middleware
- Parallel CSV scanning for faster lookup across multiple files

## Getting Started

### Prerequisites

- Node.js 18+ (or any Node.js version that supports ES modules)

### Install

```bash
cd csv_txn_lookup_express
npm install
```

### Run

Start the server in development mode:

```bash
npm run dev
```

Start the server normally:

```bash
npm start
```

Open your browser at:

```text
http://localhost:8080
```

## Project Structure

- `src/server.js` — Express server entrypoint
- `src/routes/txnRoutes.js` — API routes for transaction lookup and creation
- `src/handlers/txnHandler.js` — request handlers
- `src/services/txnService.js` — business logic for lookup and creation
- `src/loader/search.js` — CSV file discovery, parallel searching, and appending
- `src/middleware` — request ID, logging, and error middleware
- `src/public` — frontend UI assets
- `src/data` — sample CSV data files and appended transactions

## API

### Search transaction

- `GET /api/v1/txn/:id`

Response:

- `200 OK` with transaction JSON when found
- `404 Not Found` when transaction does not exist

Example response:

```json
{
  "Txn": "12345",
  "Reference": "REF-001",
  "Mode": "ONLINE",
  "FileName": "file1.csv",
  "WorkerID": 0
}
```

### Add transaction

- `POST /api/v1/txn`
- Body must be JSON with `txn`, `reference`, and `mode`

Example request body:

```json
{
  "txn": "67890",
  "reference": "REF-010",
  "mode": "OFFLINE"
}
```

Response:

- `201 Created` with the new transaction metadata
- `400 Bad Request` when required fields are missing
- `409 Conflict` when the transaction already exists

## Data Storage

- Input CSV files are loaded from `src/data`
- New transactions are appended to `src/data/added_txns.csv`

## Notes

- The frontend interacts with the API and presents search/add forms.
- If you add a transaction, it is appended to the `added_txns.csv` file.
- Search scans all CSV files in the `src/data` folder in parallel for faster results.
