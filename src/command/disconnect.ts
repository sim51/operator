import * as chalk from 'chalk';

import { Command, Option } from './../vorpal-types';

class Disconnect extends Command {

  constructor() {
    super('disconnect', 'Disconnect from neo4j', []);
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    if (global['neo4j']) {
      global['neo4j'].close();
      global['neo4j'] = null;
      vorpal.delimiter(`operator #`)
    }
    return chalk.green("Disconnected");
  }

}

const disconnect = new Disconnect();

export default disconnect;
