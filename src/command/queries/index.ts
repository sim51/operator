import * as React from 'react';
import * as blessed from "blessed";
import * as chalk from 'chalk';

import App from './application';
import { Neo4jCommand } from '../../vorpal-neo4j';

class Queries extends Neo4jCommand {

  constructor() {
    super(
      'queries',
      'Show current Neo4j\'s queries',
      []
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {

    vorpal.hide();

    // Creating our screen
    const screen = blessed.screen({
      autoPadding: true,
      smartCSR: true,
      title: 'react-blessed hello world',
      debug: true
    });

    // Rendering the React app using our screen
    const component = App.exec(screen);

    // Adding a way to quit the program
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      screen.destroy();
      screen.program = {};
      vorpal.show();
    });

    return '';

  }

}

const queries = new Queries();

export default queries;
