import * as chalk from 'chalk';

import { Command, Option } from '../vorpal-types';

import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';

class RelationshipTypes extends Neo4jCommand {

  constructor() {
    super(
      'relationshipTypes',
      'Display database relationship types',
      [new Option('-f, --format [format]', 'The output format, can be : ascii, json, csv', ['ascii', 'json', 'csv'])]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    this.checkConnection(vorpal, args.options);
    const result = await global['neo4j'].relationshipTypes();
    return result;
  }
}

const relationshipTypes = new RelationshipTypes();

export default relationshipTypes;
