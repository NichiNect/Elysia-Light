import { Command } from "commander";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import path from "path";

const makeLightModelCommand  =  new Command("make:light-model")
  .argument("<name>", "Nama model")
  .description("Make the Light Model")
  .action((name) => {
    const basePath  =  path.join(process.cwd(), "src", "models");

        // buat folder src/models kalau belum ada
    if (!existsSync(basePath)) {
      mkdirSync(basePath, { recursive: true });
    }

    const filePath  =  path.join(basePath, `${name}.ts`);

    if (existsSync(filePath)) {
      console.error(`❌ Model ${name} sudah ada!`);
      return;
    }

        // ambil stub
    let stub = readFileSync(
      path.join(process.cwd(), "src", "utils", "commands", "make", "stubs", "light-model.stub"),
      "utf-8"
    );

    // replace variable di stub
    stub = stub.replace(
      /{{\s*name\s*}}/g,
      name
    ).replace(/{{\s*fillable\s*}}/g, "")
      .replace(/{{\s*searchable\s*}}/g, "")
      .replace(/{{\s*selectable\s*}}/g, "")
      .replace(/{{\s*relations\s*}}/g, "");

    // tulis file
    writeFileSync(filePath, stub);

    console.log(`✅ Successfully Create Light Model ${name}...`);
  });

export default makeLightModelCommand;
