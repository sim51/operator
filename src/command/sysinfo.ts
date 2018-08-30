import * as chalk from 'chalk';

import { Command, Option } from '../vorpal-types';

import Format from './../service/format';
import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';
import Util from './../service/util';

class Sysinfo extends Neo4jCommand {


  constructor() {
    super(
      'sysinfo',
      'Display some usefull information about neo4j',
      [new Option('-f, --format [format]', 'The output format, can be : ascii, json, csv', ['ascii', 'json', 'csv'])]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    await this.checkConnection(vorpal, args.options);
    const query = `call dbms.queryJmx("org.neo4j:instance=kernel#0,name=Store file sizes") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "StoreSizes" as type,row,attributes[row]["value"] AS value

                  union all

                  call dbms.queryJmx("org.neo4j:instance=kernel#0,name=Page cache") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "PageCache" as type,row,attributes[row]["value"] AS value

                  union all

                  call dbms.queryJmx("org.neo4j:instance=kernel#0,name=Primitive count") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "ID Allocations" as type,row,attributes[row]["value"] AS value

                  union all

                  call dbms.queryJmx("org.neo4j:instance=kernel#0,name=Transactions") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "Transactions" as type,row,attributes[row]["value"] AS value

                  union all

                  call dbms.queryJmx("org.neo4j:instance=kernel#0,name=High Availability") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "High Availability" as type,row,attributes[row]["value"] AS value

                  union all

                  call dbms.queryJmx("org.neo4j:instance=kernel#0,name=Causal Clustering") yield attributes
                       with  keys(attributes) as k , attributes
                       unwind k as row
                       return "Causal Cluster" as type,row,attributes[row]["value"] AS value;`;
    const result = await global['neo4j'].cypher(query);

    // special display for ascii
    if (!args.options.format || args.options.format === 'ascii') {
      let resultPerTheme: string[] = [];
      ['StoreSizes', 'PageCache', 'ID Allocations', 'Transactions', 'High Availability', 'Causal Cluster'].forEach((name) => {
        const filterResult = result
          .filter((row) => { return row.type === name; })
          .map((row) => { return { row: row.row, value: row.value } });
        if (filterResult.length > 0)
          resultPerTheme.push(Format.toAsciiTable(filterResult, name));
      });
      return Util.mergeLineByLine(resultPerTheme);
    }

    return result;
  }
}

const sysinfo = new Sysinfo();

export default sysinfo;
