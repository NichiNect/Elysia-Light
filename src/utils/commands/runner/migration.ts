import { Command } from "commander";
import path from "path";
import { db } from '@/utils/db.utils'
import fs from "fs";
import { Client } from "pg";

export const migrateCommand = new Command("migrate")
  .description("Run all migration")
  .action(async () => 
{

  await ensureDatabaseExists(process.env.DB_DATABASE || "db_elysia_light");

  const hasTable = await db.schema.hasTable("migrations");
  if (!hasTable) {
    await db.schema.createTable("migrations", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.timestamp("batch").defaultTo(db.raw("CURRENT_TIMESTAMP"));
    });
  }

  await runMigrationFile()

  process.exit(0);
});


export const migrateFreshCommand = new Command("migrate:fresh")
  .description("Fresh and run all migration")
  .action(async () => 
{
  await ensureDatabaseExists(process.env.DB_DATABASE || "db_elysia_light");

  await db.raw(`DROP SCHEMA public CASCADE;`);
  await db.raw(`CREATE SCHEMA public;`);

  console.log("Database schema has been freshed...");

  await db.schema.createTable("migrations", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.timestamp("batch").defaultTo(db.raw("CURRENT_TIMESTAMP"));
  });

  await runMigrationFile()

  process.exit(0);
});


async function runMigrationFile() {
  const migrations = await db.table("migrations").select("name").get();
  const migrated = migrations.map((row: any) => row.name);

  const migrationsDir = path.resolve("./src/database/migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  let countMigrated = 0;

  console.log("⌛ Running migrations...");

  for (const file of files) {
    if (migrated.includes(file)) continue
    
    const tableName = extractTableName(file)

    if (tableName) {
      const exists = await db.schema.hasTable(tableName)
      if (exists) {
        console.error(`❌ Table "${tableName}" already exists`)
        process.exit(1);
      }
    }

    const mod = await import(path.join(migrationsDir, file));
    const MigrationClass = mod.default;
    if (MigrationClass) {
      const migr = new MigrationClass();
      await migr.up(db.schema);
      await db.table("migrations").insert({ name: file });
      console.log(`Migrated: ${file}...`);
    }

    countMigrated++
  }

  if(countMigrated > 0) {
    console.log(`✅ Success run all migration!`);
  } else {
    console.warn(`❗ Nothing to migrate!`);
  }
}


async function ensureDatabaseExists(databaseName: string) {
  const client = new Client({
    host      :  process.env.DB_HOST          ||  '127.0.0.1',
    port      :  Number(process.env.DB_PORT)  ||  5432,
    user      :  process.env.DB_USERNAME      ||  'postgres',
    password  :  process.env.DB_PASSWORD      ||  'password',
    database  :  "postgres",
  });

  await client.connect();

  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName]
  );

  if (res.rowCount === 0) {
    console.log(`⚙️ Database ${databaseName} belum ada. Membuat baru...`);
    await client.query(`CREATE DATABASE "${databaseName}"`);
    console.log(`✅ Database ${databaseName} berhasil dibuat.`);
  }

  await client.end();
}


function extractTableName(file: string): string | null {
  const filename = path.basename(file, path.extname(file))
  const filenameParts = filename.split("_")

  const filtered = filenameParts.filter(
    (p, k) => k != 0 && !["add", "update", "table"].includes(p.toLowerCase())
  )

  if (filtered.length === 0) return null

  return filtered.join("_")
}