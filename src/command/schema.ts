import * as Viz from "viz.js";
import * as chalk from 'chalk';

import { Command, Option } from '../vorpal-types';
import { Module, render } from 'viz.js/full.render.js';

import File from './../service/file';
import Format from './../service/format';
import { Neo4jCommand } from '../vorpal-neo4j';
import Neo4jService from './../service/neo4j';

class Schema extends Neo4jCommand {

  constructor() {
    super(
      'schema',
      'Compute the schema of the database',
      [
        new Option('-F, --file <file>', 'File to be generated, if nothing is specifiy the content will be dislplay in the console (if possible)', ['model.svg']),
        new Option('-f, --format [format]', 'The output format, can be : json, graphviz, svg', ['graphviz', 'svg', 'json', 'csv']),
        new Option('-l, --ignore-labels <labels>', 'Regex to apply for ignore labels', []),
        new Option('-t, --ignore-types <type>', 'Regex to apply for ignoring edges', [])
      ]
    );
  }

  execute = async (vorpal: any, args: any): Promise<any> => {
    await this.checkConnection(vorpal, args.options);

    // Generate the JSON schema
    const schema = await global['neo4j'].schema(args.options['ignore-labels'] || null, args.options['ignore-types'] || null);

    // Depends of the choosen format
    let result: string;
    switch (args.options.format || '') {
      case 'svg':
        result = await this.schemaToSVG(schema);
        break;
      case 'graphviz':
        result = this.schemaToGraphViz(schema);
        break;
      default:
        result = Format.toJson(schema);
        break;
    }

    // Display result in TTY or in a file
    if (args.options.file) {
      await File.write(args.options.file, result);
      return chalk.green(`File ${args.options.file} generated`);
    }
    else {
      return result;
    }
  }

  schemaToSVG = async (schema: any): Promise<string> => {
    const viz = new Viz({ Module, render });
    const svg = await viz.renderString(this.schemaToGraphViz(schema));
    return svg;
  }

  schemaToGraphViz = (schema: any): string => {
    let graphviz = "digraph finite_state_machine { \n\t rankdir=LR; \n\t node [ \n\t\t shape = Mrecord, \n\t ]; \n";
    graphviz += "\n\n";
    schema.nodes.map(node => {
      graphviz += this.nodeSchemaToGraphviz(node);
    });
    graphviz += "\n\n";
    schema.edges.map(edge => {
      graphviz += this.edgeSchemaToGraphviz(edge);
    });
    graphviz += "\n}";
    return graphviz;
  }

  private nodeSchemaToGraphviz = (node: any): string => {
    let graphviz = "\t " + node.title + " [ label= \"" + node.title;
    let props = [];
    Object.keys(node.properties).map(key => {
      let prop = node.properties[key];
      props.push(prop.title + " (" + prop.type + ")");
    });
    if (props.length > 0) {
      graphviz += " | " + props.join(" \\l ");
    }
    graphviz += "\\l\"];\n";
    return graphviz;
  };

  private edgeSchemaToGraphviz = (edge: any): string => {
    let graphviz = "\t " + edge.start + " -> " + edge.end + " [ label= \"" + edge.title;
    let props = [];
    Object.keys(edge.properties).map(key => {
      if (key != "__type__") {
        let prop = edge.properties[key];
        props.push(prop.title + " (" + prop.type + ")");
      }
    });
    if (props.length > 0) {
      graphviz += "\\l {" + props.join(", ") + "}";
    }
    graphviz += "\"];\n";
    return graphviz;
  };

}

const schema = new Schema();

export default schema;
