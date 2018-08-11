import * as chalk from 'chalk';

import Format from '../service/format';
import { Neo4jMode } from '../vorpal-neo4j';

class Cypher extends Neo4jMode {

  constructor() {
    super(
      'cypher',
      'A Cypher shell',
      'cypher ~',
      []
    );
  }


  init = async (vorpal: any, args: any): Promise<any> => {
    this.checkConnection(vorpal, args.options);

    // Init query parameters to empty
    vorpal.localStorage.setItem('params', '{}');

    const welcomeTxt = 'Welcome to Cypher mode.\nYou can now directly enter arbitrary Cypher commands. To exit, type `exit`.';
    return vorpal.log(chalk.green(welcomeTxt));
  }

  execute = async (vorpal: any, command: any): Promise<any> => {
    let result = '';

    if (command.startsWith(':params')) {
      vorpal.localStorage.setItem('params', command.replace(':params', ''));
    }
    else {
      // update the query
      if (vorpal.localStorage.getItem('query') === '')
        vorpal.localStorage.setItem('query', vorpal.localStorage.getItem('query') + command);
      else
        vorpal.localStorage.setItem('query', vorpal.localStorage.getItem('query') + '\n' + command);
      vorpal.session.modeDelimiter('cypher >');

      // Execute the query
      if (command.endsWith(';')) {
        let query = vorpal.localStorage.getItem('query');

        // reset
        vorpal.localStorage.setItem('query', '');
        vorpal.session.modeDelimiter('cypher ~');
        result = await global['neo4j'].cypher(query, eval("(" + vorpal.localStorage.getItem('params') + ')'));
        if (result.length === 0) {
          result = 'no data found';
        }
      }
    }
    return Format.toAsciiTable(result);
  }
}

const cypher = new Cypher();

export default cypher;
