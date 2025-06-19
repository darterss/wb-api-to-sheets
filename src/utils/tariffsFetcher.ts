import knex from "#postgres/knex.js";
import env from "#config/env/env.js";

function parseNumber<T extends keyof WarehouseTaxes>(warehouse: Warehouse, field: T): number | null {
    const str = warehouse[field];
    if (!str || str === "-") return null;
    const ret = parseFloat(str.replace(",", "."));
    if (isNaN(ret)) {
        throw new Error(`Недопустимое значение поля ${field} в ${warehouse.warehouseName}: ${str}`);
    }
    return ret;
}

type Warehouse = {
    warehouseName: string,
} & WarehouseTaxes

type WarehouseTaxes = {
    boxDeliveryAndStorageExpr: string,
    boxDeliveryBase: string,
    boxDeliveryLiter: string,
    boxStorageBase: string,
    boxStorageLiter: string,
}

export async function fetchAndSave() {
    const date = new Date().toISOString().slice(0, 10);

    const res = await fetch(`https://common-api.wildberries.ru/api/v1/tariffs/box?date=${date}`, {
        headers: { Authorization: env.WB_TOKEN }
    });

    const data = await res.json();

    const warehouseList: Warehouse[] = data?.response?.data?.warehouseList ?? [];

    for (const entry of warehouseList) {
        const { warehouseName } = entry;

        if (!warehouseName) continue;

        try {
            const boxDeliveryAndStorageExprVal = parseNumber(entry, 'boxDeliveryAndStorageExpr');
            const boxDeliveryBaseVal = parseNumber(entry, 'boxDeliveryBase');
            const boxDeliveryLiterVal = parseNumber(entry, 'boxDeliveryLiter');
            const boxStorageBaseVal = parseNumber(entry, 'boxStorageBase');
            const boxStorageLiterVal = parseNumber(entry, 'boxStorageLiter');

            await knex("tariffs_box")
                .insert({
                    date,
                    warehouse_name: warehouseName,
                    boxDeliveryAndStorageExpr: boxDeliveryAndStorageExprVal,
                    boxDeliveryBase: boxDeliveryBaseVal,
                    boxDeliveryLiter: boxDeliveryLiterVal,
                    boxStorageBase: boxStorageBaseVal,
                    boxStorageLiter: boxStorageLiterVal,
                    updated_at: knex.fn.now()
                })
                .onConflict(["date", "warehouse_name"])
                .merge({
                    boxDeliveryAndStorageExpr: boxDeliveryAndStorageExprVal,
                    boxDeliveryBase: boxDeliveryBaseVal,
                    boxDeliveryLiter: boxDeliveryLiterVal,
                    boxStorageBase: boxStorageBaseVal,
                    boxStorageLiter: boxStorageLiterVal,
                    updated_at: knex.fn.now()
                });

        } catch (err) {
            console.error("Ошибка при сохранении в БД:", err);
        }
    }
}