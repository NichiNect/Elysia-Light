import { Migration, SchemaBuilder } from 'sutando';

export default class AddUsersTable extends Migration 
{
  // =========================>
  // ## Run the migration
  // =========================>
  async up(schema: SchemaBuilder) {
    await schema.createTable('users', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('email').unique().notNullable()
      table.string('password')
      table.timestamps(true, true)
    });

    await schema.createTable('personal_access_tokens', (table) => {
      table.increments('id').primary()
      table.integer("user_id").unsigned().index().notNullable()
      table.string('token').unique().notNullable()
      table.timestamp('last_used_at')
      table.timestamp('expired_at')
      table.timestamps(true, true)
    });
  }

  // =========================>
  // ## Reverse the migrations.
  // =========================>
  async down(schema: any) {
    await schema.dropTableIfExists('users');
  }
}