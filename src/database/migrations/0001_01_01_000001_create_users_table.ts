import { Migration } from 'sutando';

export default class AddUsersTable extends Migration 
{
  // =========================>
  // ## Run the migration
  // =========================>
  async up(schema: any) {
    await schema.createTable('users', (table: any) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('email').unique().notNullable()
      table.string('password')
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