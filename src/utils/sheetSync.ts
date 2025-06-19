import knex from "#postgres/knex.js";
import { google } from "googleapis";
import env from "#config/env/env.js";

export async function syncToSheets() {
    const auth = new google.auth.GoogleAuth({
        keyFile: env.GOOGLE_CREDENTIALS_PATH,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
    const sheets = google.sheets({ version: "v4", auth });
    const date = new Date().toISOString().slice(0, 10);

    const rows = await knex("tariffs_box")
        .where({ date })
        .orderBy("boxDeliveryAndStorageExpr", "asc");

    for (const spreadsheetId of env.SHEET_IDS.split(",")) {
        try {
            // список листов
            const metadata = await sheets.spreadsheets.get({ spreadsheetId });
            const sheetsList = metadata.data.sheets ?? [];
            const sheetExists = sheetsList.some(
                (s) => s.properties?.title === "stocks_coefs"
            );

            if (!sheetExists) {
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: "stocks_coefs"
                                    }
                                }
                            }
                        ]
                    }
                });
                console.log(`Лист 'stocks_coefs' создан в таблице ${spreadsheetId}`);
            }

            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: "stocks_coefs"
            });

            const values = [
                [
                    "warehouse_name",
                    "boxDeliveryAndStorageExpr",
                    "boxDeliveryBase",
                    "boxDeliveryLiter",
                    "boxStorageBase",
                    "boxStorageLiter",
                    "date",
                    "time"
                ],
                ...rows.map((r) => [
                    r.warehouse_name,
                    r.boxDeliveryAndStorageExpr?.toString() ?? "",
                    r.boxDeliveryBase?.toString() ?? "",
                    r.boxDeliveryLiter?.toString() ?? "",
                    r.boxStorageBase?.toString() ?? "",
                    r.boxStorageLiter?.toString() ?? "",
                    r.date?.toString()?.slice(0, 10) ?? "",
                    r.updated_at?.toString()?.slice(16, 31) ?? "",
                ]),
            ];

            // запись в таблицу
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: "stocks_coefs",
                valueInputOption: "RAW",
                requestBody: { values },
            });

        } catch (error) {
            if (error instanceof Error) {
                console.log(`Ошибка при обращении к таблице c ID ${spreadsheetId}:`, error.message);
            } else if (typeof error === 'object' && error !== null && 'errors' in error) {
                const googleError = error as { errors: Array<{ message: string }> };
                console.log(`Ошибка Google API:`, googleError.errors[0]?.message);
            } else {
                console.log(`Неизвестная ошибка:`, String(error));
            }
        }
    }
}

