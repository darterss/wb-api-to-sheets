import cron from "node-cron";
import { fetchAndSave } from "./tariffsFetcher.js";
import { syncToSheets } from "./sheetSync.js";

async function task() {
  await fetchAndSave();
  await syncToSheets();
}

cron.schedule("0 * * * *", () => task().catch(console.error)); // каждый час
task().catch(console.error); // на старте
