/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.createTable("tariffs_box", (t) => {
        t.date("date").notNullable();
        t.string("warehouse_name").notNullable();
        t.decimal("boxDeliveryAndStorageExpr", 10, 4).nullable();
        t.decimal("boxDeliveryBase", 10, 4).nullable();
        t.decimal("boxDeliveryLiter", 10, 4).nullable();
        t.decimal("boxStorageBase", 10, 4).nullable();
        t.decimal("boxStorageLiter", 10, 4).nullable();
        t.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        t.primary(["date", "warehouse_name"]);
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.dropTableIfExists("tariffs_box");
}
