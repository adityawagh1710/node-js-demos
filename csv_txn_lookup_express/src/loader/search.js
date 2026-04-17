
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getResolvedDir = (dir) => path.resolve(__dirname, dir);
const addedFilePath = path.join(getResolvedDir("../data"), "added_txns.csv");

export const getCSVFiles = async (dir) => {
  const directory = getResolvedDir(dir);
  const files = await fs.promises.readdir(directory);
  return files.filter(f => f.endsWith(".csv")).map(f => path.join(directory, f));
};

export const searchTxnParallel = async (files, txnId) => {
  return new Promise((resolve) => {
    if (!files.length) {
      return resolve(null);
    }

    let found = false;
    let pending = files.length;
    const streams = [];

    const cleanup = () => {
      streams.forEach((stream) => {
        if (!stream.destroyed) {
          stream.destroy();
        }
      });
    };

    files.forEach((file, index) => {
      const stream = fs.createReadStream(file)
        .pipe(csv({ headers: ["Txn", "Reference", "Mode"], skipLines: 0 }))
        .on("data", (row) => {
          if (found) return;

          if (row.Txn === txnId) {
            found = true;
            cleanup();
            resolve({
              ...row,
              FileName: path.basename(file),
              WorkerID: index
            });
          }
        })
        .on("end", () => {
          pending -= 1;
          if (pending === 0 && !found) {
            resolve(null);
          }
        })
        .on("error", () => {
          pending -= 1;
          if (pending === 0 && !found) {
            resolve(null);
          }
        });

      streams.push(stream);
    });
  });
};

export const appendTxn = async ({ Txn, Reference, Mode }) => {
  await fs.promises.mkdir(path.dirname(addedFilePath), { recursive: true });
  await fs.promises.appendFile(addedFilePath, `${Txn},${Reference},${Mode}\n`, "utf8");
  return {
    Txn,
    Reference,
    Mode,
    FileName: path.basename(addedFilePath),
    WorkerID: "new"
  };
};
