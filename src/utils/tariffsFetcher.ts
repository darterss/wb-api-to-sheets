import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

const parseNumber = (str: string) => {
    if (!str || str === "-") return null;
    return parseFloat(str.replace(",", "."));
};

export async function fetchAndSave() {
    const date = new Date().toISOString().slice(0, 10);

    const res = await fetch(`https://common-api.wildberries.ru/api/v1/tariffs/box?date=${date}`, {
        headers: { Authorization: env.WB_TOKEN }
    });

    const data = await res.json();

    const warehouseList = data?.response?.data?.warehouseList ?? [];

    for (const entry of warehouseList) {
        const {
            warehouseName,
            boxDeliveryAndStorageExpr,
            boxDeliveryBase,
            boxDeliveryLiter,
            boxStorageBase,
            boxStorageLiter
        } = entry;

        if (!warehouseName) continue;

        try {
            await knex("tariffs_box")
                .insert({
                    date,
                    warehouse_name: warehouseName,
                    boxDeliveryAndStorageExpr: parseNumber(boxDeliveryAndStorageExpr),
                    boxDeliveryBase: parseNumber(boxDeliveryBase),
                    boxDeliveryLiter: parseNumber(boxDeliveryLiter),
                    boxStorageBase: parseNumber(boxStorageBase),
                    boxStorageLiter: parseNumber(boxStorageLiter),
                    updated_at: knex.fn.now()
                })
                .onConflict(["date", "warehouse_name"])
                .merge({
                    boxDeliveryAndStorageExpr: parseNumber(boxDeliveryAndStorageExpr),
                    boxDeliveryBase: parseNumber(boxDeliveryBase),
                    boxDeliveryLiter: parseNumber(boxDeliveryLiter),
                    boxStorageBase: parseNumber(boxStorageBase),
                    boxStorageLiter: parseNumber(boxStorageLiter),
                    updated_at: knex.fn.now()
                });

        } catch (err) {
            console.error("Ошибка при сохранении в БД:", err);
        }
    }
}
