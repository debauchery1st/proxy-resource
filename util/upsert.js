const knex = require("../database/connection");

async function upsert({ table, records }) {
  const result = await knex.raw(
    `? ON CONFLICT (number, colors, origin)
          DO NOTHING
          RETURNING *;`,
    [knex(table).insert(records)]
  );
  return result;
}

export default upsert;
