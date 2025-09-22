import { Command } from "commander";
import path from "path";
import fs from "fs";

const seederCommand = new Command("seeder")
  .description("Run all database seeders")
  .action(async () => {
    try {
        const seedersDir  =  path.resolve("./src/database/seeders");
        const files       =  fs.readdirSync(seedersDir).filter(f => f.endsWith(".ts"));

        console.log("🌱 Running seeders...");

        for (const file of files) {
            const seederPath = path.join(seedersDir, file);
            const { default: seeder } = await import(seederPath);

            if (typeof seeder === "function") {
                console.log(`Planted: ${file}...`);
                await seeder();
            }
        }

        console.log("✅ Success run all seeders!");
        process.exit(0);
    } catch (error) {
      console.error("Error running seeds:", error);
      process.exit(1);
    }
  });

export default seederCommand;