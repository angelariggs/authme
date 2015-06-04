
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tweets', function(table) {
    table.increments('id').primary();
    table.integer('userID').references('id').inTable('users');
    table.string('tweet');
    table.dateTime('timestamp');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tweets');
};
