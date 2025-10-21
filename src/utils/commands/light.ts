import { Command } from "commander";
import makeControllerCommand from "./make/basic-controller";
import makeModelCommand from "./make/basic-model";
import makeMigrationCommand from "./make/basic-migration";
import makeSeederCommand from "./make/basic-seeder";
import makeLightControllerCommand from "./make/light-controller";
import { migrateCommand, migrateFreshCommand } from "./runner/migration";
import seederCommand from "./runner/seeder";
import makeLightModelCommand from "./make/light-model";
import { blueprintCommand } from "./runner/blueprint";

const program = new Command();

program
  .name("elysia-light-cli")
  .description("Elysia Light CLI")
  .version("1.0.0");

program.addCommand(makeControllerCommand);
program.addCommand(makeModelCommand);
program.addCommand(makeMigrationCommand);
program.addCommand(makeSeederCommand);
program.addCommand(makeLightControllerCommand);
program.addCommand(makeLightModelCommand);
program.addCommand(migrateCommand);
program.addCommand(migrateFreshCommand);
program.addCommand(seederCommand);
program.addCommand(blueprintCommand);

program.parse(process.argv);
