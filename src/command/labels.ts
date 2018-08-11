import * as chalk from 'chalk';

import { Command, Option } from '../vorpal-types';

import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';

class Labels extends Neo4jCommand {

  constructor() {
    super(
      'labels',
      'Display database labels',
      [new Option('-f, --format [format]', 'The output format, can be : ascii, json, csv', ['ascii', 'json', 'csv'])]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    this.checkConnection(vorpal, args.options);
    const result = await global['neo4j'].labels();
    return result;
  }
}

const labels = new Labels();

export default labels;
