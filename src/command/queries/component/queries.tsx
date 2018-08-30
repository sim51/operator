import * as React from 'react';

import Neo4jService from './../../../service/neo4j';

export default class Queries extends React.Component<any, any> {

  /*
   * Static properties
   */
  tick_time: number = 500;
  table_style: any = {
    header: { fg: 'black', bg: 'green' },
    cell: { fg: 'green', selected: { bg: 'cyan', fg: 'black' } }
  };

  /*
   * Class properties
   */
  timer: any;
  neo4j: Neo4jService;

  /*
   * Component properties
   */
  headers: String[];
  sortField: String;
  sortOrder: String;

  constructor(props) {
    super(props);
    this.neo4j = global['neo4j'];
    this.state = {
      queries: [],
      selected: 1
    };
  }


  tick = async () => {
    this.timer = setTimeout(async () => {
      await this.refreshList();
      this.tick();
    }, this.tick_time);
  }

  stop = () => {
    clearTimeout(this.timer);
  }

  componentDidMount = () => {
    this.tick();
    this.refs.node['on']('keypress', this.onKeypress());
  }

  componentWillUnmount = () => {
    this.stop();
  }

  onKeypress = () => {
    return (ch, key) => {
      if (key.name === 'up' || key.name === 'down' || key.name === 'k') {

        // Go up & down in the list
        if (key.name === 'up' || key.name === 'down') {
          let newSelected = this.state.selected - 1;
          if (key.name === 'down') {
            newSelected = this.state.selected + 1;
          }
          if (newSelected > 0 && newSelected <= this.state.queries.length) {
            this.setState({ selected: newSelected })
          }
        }

        // Killing the query
        if (key.name === 'k') {
          this.killQuery()
        }

      }
    }
  }


  refreshList = async () => {
    // Get the query list
    const queries = await this.neo4j.cypher('CALL dbms.listQueries()', {})
    // Sort the result with the specified order
    queries.sort((a, b) => {
      const field: string = this.props.sortField;
      if (a[field] < b[field]) {
        return -1
      }
      if (a[field] > b[field]) {
        return 1
      }
      return 0;
    });
    // Save in the state
    this.setState({
      queries: queries
    })
  }

  killQuery = async () => {
    const result = await this.neo4j.cypher(`CALL dbms.killQuery('${this.state.queries[this.state.selected - 1].queryId}')`, {});
    return result;
  }

  queriesToListTable = (): string[][] => {
    // transform array of queries to an arrray of array of string
    let queries = this.state.queries.map(
      (query) => {
        let array = [];
        this.props.headers.forEach((key: string) => {
          array.push(JSON.stringify(query[key]));
        });
        return array
      }
    );
    // Add the header in first row
    queries.unshift(this.props.headers);
    return queries;
  }

  /**
   * Search the listtable index of the selected query (by its query id).
   * @return {number} Return the index of -1 if not found
   */
  indexOfSelected = (): number => {
    let found: number = -2;
    let index: number = 0;
    while (found < 0 && index < this.state.queries.length) {
    }
    if (this.state.queries[index]['queryId'] === this.state.queries.selected) {
      found = index;
    }
    // +1 is here due to the header of the tab
    return found + 1;
  }

  render = () => {
    return (
      <listtable
        ref="node"
        width='100%'
        left='0'
        right='0'
        style={this.table_style}
        rows={this.queriesToListTable()}
        selected={this.state.selected}
        focused={true}
      >
      </listtable>
    );
  }
}
