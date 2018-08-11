import * as chalk from 'chalk';

import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';
import { Option } from '../vorpal-types';
import connect from './connect';

class Constraints extends Neo4jCommand {

  constructor() {
    super(
      'constraints',
      'Display database constraints',
      [new Option('-f, --format [format]', 'The output format, can be : ascii, json, csv', ['ascii', 'json', 'csv'])]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    this.checkConnection(vorpal, args.options);
    const result = await global['neo4j'].constraints();
    return result;
  }

}

const constraints = new Constraints();

export default constraints;
