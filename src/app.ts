import { migrate, seed } from "#postgres/knex.js";
import { run } from "./utils/scheduler.js"

await migrate.latest()
await seed.run()
run()


console.log("All migrations and seeds have been run");