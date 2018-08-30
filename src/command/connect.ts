import * as chalk from 'chalk';

import { Neo4jCommand } from '../vorpal-neo4j';

class Connect extends Neo4jCommand {

  constructor() {
    super(
      'connect',
      'Connect to a Neo4j instance',
      []
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    if (!global['neo4j']) {
      await this.checkConnection(vorpal, args.options, false);
    }
    else {
      vorpal.log(chalk.red("A connection is already created. If you want to connect to an other instance, you firstly have to use `disconnect`"));
    }
    return '';
  }

}

const connect = new Connect();

export default connect;
