import * as chalk from 'chalk';

import { Command, IMode, Option } from './vorpal-types';

import Neo4jService from './service/neo4j';

export abstract class Neo4jCommand extends Command {

  defaultBolt: string = 'bolt://localhost:7687';
  defaultUser: string = 'neo4j';
  defaultPassword: string = 'neo4j';

  constructor(name: string, description: string, options: Option[]) {
    super(name, description, options);
    [
      new Option('-b, --bolt <url>', 'Neo4j bolt uri', ['bolt://localhost:7687']),
      new Option('-u, --user <user>', 'Neo4j User', ['neo4j']),
      new Option('-p, --password <password>', 'Neo4j Password', ['neo4j'])
    ].forEach((option: Option) => {
      this.options.push(option);
    });
  }

  protected checkConnection = async (vorpal: any, answers: any, quiet: boolean = true): Promise<any> => {
    if (!global['neo4j']) {
      let connected: boolean = false;
      let firstTime = true;
      let neo4j: Neo4jService = null;

      while (!connected) {
        try {
          neo4j = new Neo4jService(answers.bolt || this.defaultBolt, answers.user || this.defaultUser, answers.password || this.defaultPassword);
          let result = await neo4j.cypher('RETURN 1');
          connected = true;
          if (!quiet)
            vorpal.log(chalk.green(`Connected to ${answers.bolt || this.defaultBolt} as ${answers.user || this.defaultUser}`));
        }
        catch (e) {
          if (!firstTime)
            vorpal.log(chalk.red(e.message));
        }

        firstTime = false;
        if (!connected) {
          answers = await this.prompt(vorpal, answers);
        }
        else {
          global['neo4j'] = neo4j;
          vorpal.delimiter(`operator ${answers.user || this.defaultUser}@${answers.bolt || this.defaultBolt} #`);
        }
      }
    }
  }

  private prompt = async (vorpal: any, answers: any): Promise<any> => {
    const questions: any[] = [
      { type: 'input', name: 'bolt', message: 'Bolt url: ', default: answers.bolt || this.defaultBolt },
      { type: 'input', name: 'user', message: 'Username: ', default: answers.user || this.defaultUser },
      { type: 'password', name: 'password', message: 'Password:', default: answers.password || this.defaultPassword }
    ];

    return new Promise<any>((resolve, reject) => {
      vorpal.activeCommand.prompt(questions, (answers) => {
        resolve(answers);
      });
    });
  }

  abstract execute(vorpal: any, args: any): Promise<any>;
}

export abstract class Neo4jMode extends Neo4jCommand implements IMode {

  delimiter: string;

  constructor(name: string, description: string, delimiter, options: Option[]) {
    super(name, description, options);
    this.delimiter = delimiter;
  }

  abstract init(vorpal: any, args: any): Promise<any>;
  abstract execute(vorpal: any, args: any): Promise<any>;
}
