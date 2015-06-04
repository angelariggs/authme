
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tweets', function(table) {
    table.increments('id').primary();
    table.string('username');
    table.string('tweet');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tweets');
};
