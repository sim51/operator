import * as Vorpal from "vorpal";
import * as chalk from 'chalk';

import { Command, Mode, Option } from './vorpal-types';

import Format from './service/format';
import connect from './command/connect';
import constraints from './command/constraints';
import cypher from './mode/cypher';
import disconnect from './command/disconnect';
import indexes from './command/indexes';
import labels from './command/labels';
import properties from './command/properties';
import queries from './command/queries/index';
import relationshipTypes from './command/relationshipTypes';
import schema from './command/schema';
import sysinfo from './command/sysinfo';

// I know it's not cool to use global
global['neo4j'] = null;

// init vorpal
const vorpal = Vorpal();

// Plugin definition
const commands: Command[] = [
  connect,
  constraints,
  disconnect,
  indexes,
  labels,
  properties,
  queries,
  relationshipTypes,
  schema,
  sysinfo
];

// Mode definition
const modes: Mode[] = [
  cypher
];

// Load all modes
modes.forEach((plugin: Mode) => {
  // Create vorpal mode
  let mode = vorpal
    .mode(plugin.name)
    .description(plugin.description)
    .delimiter(plugin.delimiter);

  // register command options
  plugin.options.forEach((opt: Option) => {
    mode.option(opt.name, opt.description, opt.autocomplete);
  });
  // register init
  mode.init((args, callback) => {
    plugin
      .init(vorpal, args)
      .then((result) => {
        callback();
      })
      .catch((e) => {
        vorpal.log(chalk.red(e));
        callback();
      });
  });
  // register action
  mode.action((args, callback) => {
    plugin
      .execute(vorpal, args)
      .then((result) => {
        if (result !== '') {
          vorpal.log(result);
        }
        callback();
      })
      .catch((e) => {
        vorpal.log(chalk.red(e));
        callback();
      });
  });
});

// Load all command
commands.forEach((plugin: Command) => {
  // Create vorpal command
  let cmd = vorpal.command(plugin.name, plugin.description);
  // register command options
  plugin.options.forEach((opt: Option) => {
    cmd.option(opt.name, opt.description, opt.autocomplete);
  });
  // register action
  cmd.action((args, callback) => {
    plugin
      .execute(vorpal, args)
      .then((result) => {
        if (result !== '') {
          if (args.options.format && ['csv', 'json'].indexOf(args.options.format) > -1) {
            switch (args.options.format) {
              case 'csv':
                vorpal.log(Format.toCsv(result));
                break;
              case 'json':
                vorpal.log(Format.toJson(result));
                break;
            }
          }
          else {
            vorpal.log(Format.toAsciiTable(result));
          }
        }
        callback();
      })
      .catch((e) => {
        vorpal.log(chalk.red(e));
        callback();
      });
  });
});

// init the localstorage
vorpal.localStorage('operator');

// Some keyboard shortcut
// vorpal.on('keypress', (event) => {
//
//   // ctrl+e : run the editor
//   if (event.key === 'e' && event.e.key.ctrl) {
//     //Util.readEditor();
//   }
//
//   // ctrl+l : clear
//   if (event.key === 'l' && event.l.key.ctrl) {
//     process.stdout.write("\u001B[2J\u001B[0;0f");
//   }
//
// });

if (process.argv.length > 2) {
  vorpal.parse(process.argv);
}
else {
  vorpal
    .history('operator')
    .delimiter('operator #')
    .show();
}
