/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
    await knex.schema.alterTable("tariffs_box", (t) => {
        t.index(["date"], "idx_tariffs_box_date");
    });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
    await knex.schema.alterTable("tariffs_box", (t) => {
        t.dropIndex(["date"], "idx_tariffs_box_date");
    });
}
