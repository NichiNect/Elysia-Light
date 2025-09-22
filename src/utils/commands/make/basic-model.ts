import { Command } from "commander";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import fs from "fs";

const makeModelCommand = new Command("make:model")
  .argument("<name>", "Nama model")
  .description("Membuat file model baru")
  .action((name) => {
    const fileName = `${name}.ts`;
    const filePath = path.join(process.cwd(), "src", "models", fileName);

    if (!existsSync(path.dirname(filePath))) {
      mkdirSync(path.dirname(filePath), { recursive: true });
    }

    let content  =  fs.readFileSync('./src/utils/commands/make/stubs/basic-model.stub', 'utf-8');;
    
    content  =  content.replace(/{{\s*name\s*}}/g, name || "")

    writeFileSync(filePath, content);
    console.log(`✅ Model ${fileName} created!`);
  });

export default makeModelCommand;
