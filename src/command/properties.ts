import * as chalk from 'chalk';

import { Command, Option } from '../vorpal-types';

import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';

class Properties extends Neo4jCommand {

  constructor() {
    super(
      'properties',
      'Display database property keys',
      [new Option('-f, --format [format]', 'The output format, can be : ascii, json, csv', ['ascii', 'json', 'csv'])]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    await this.checkConnection(vorpal, args.options);
    const result = await global['neo4j'].properties();
    return result;
  }
}

const properties = new Properties();

export default properties;
