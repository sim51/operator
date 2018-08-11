import * as Neo4j from "neo4j-driver";

/**
 * Service that communicate with Neo4j server.
 */
export default class Neo4jService {

  // The neo4j driver instance
  private driver: any;
  private url: string;
  private user: string;

  /**
   * Constructor.
   * @param {string} url Connection url to the database (ex: bolt://localhost)
   * @param {string} user User login of the database
   * @param {string} password User password of the database
   */
  constructor(url: string, user: string, password: string) {
    this.url = url;
    this.user = user;
    this.driver = Neo4j.v1.driver(url, Neo4j.v1.auth.basic(user, password), { disableLosslessIntegers: true });
  }

  /**
   * Execute a cypher query and return an array of object.
   *
   * @param query {string} the query string
   * @param params {array} array of params
   * @returns {Promise<any[]>}
   */
  cypher = async (query: string, parameters: any = {}): Promise<any[]> => {
    return new Promise<any[]>((resolve, reject) => {
      let session = this.driver.session();
      session
        .run(query, parameters)
        .then(result => {
          let rs = [];
          result.records.forEach(record => {
            let item = {};
            record.forEach((value, key) => {
              item[key] = this.convertObjectDriverToJs(value);
            });
            rs.push(item);
          });
          session.close();
          resolve(rs);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Get all labels available.
   * @returns {Promise<string[]>} Array of label as a promise
   */
  labels = async (): Promise<string[]> => {
    let result = await this.cypher("CALL db.labels");
    return result.map((item) => { return item.label });
  }

  /**
   * Get all relationship type available.
   * @returns {Promise<string[]>} Array of relationship type as a promise
   */
  relationshipTypes = async (): Promise<string[]> => {
    let result = await this.cypher("CALL db.relationshipTypes");
    return result.map((item) => { return item.relationshipType });
  }

  /**
   * Get all properties available.
   * @returns {Promise<string[]>} Array of property as a promise
   */
  properties = async (): Promise<string[]> => {
    let result = await this.cypher("CALL db.propertyKeys");
    return result.map((item) => { return item.propertyKey });
  }

  /**
   * Get all database indexes.
   * @returns {Promise<any[]>} Array of schema
   */
  indexes = async (): Promise<any[]> => {
    const indexeRegex = /INDEX ON :(.*)\((.*)\)/;
    const types = {
      node_unique_property: "unique",
      node_label_property: "index"
    };

    let result = await this.cypher("CALL db.indexes()");
    return result.map((item) => {
      return {
        on: 'Node',
        name: item.description.match(indexeRegex)[1],
        property: item.description.match(indexeRegex)[2],
        state: item.state,
        type: types[item.type]
      }
    });
  }

  /**
   * Get all database constraints.
   * @returns {Promise<any[]>} Array of schema
   */
  constraints = async (): Promise<any[]> => {
    const constraintNodeExistRegex = /CONSTRAINT ON \( (.*):(.*) \) ASSERT exists\((.*)\.(.*)\)/;
    const constraintNodeUniqueRegex = /CONSTRAINT ON \( (.*):(.*) \) ASSERT (.*)\.(.*) IS UNIQUE/;
    const constraintRelExistRegex = /CONSTRAINT ON \(\)-\[ (.*):(.*) \]-\(\) ASSERT exists\((.*)\.(.*)\)/;
    const constraintNodeKeyRegex = /CONSTRAINT ON \( (.*):(.*) \) ASSERT \(?([^\)]*)\)? IS NODE KEY/;

    let result = await this.cypher("CALL db.constraints()");
    return result.map((record) => {
      let item = {};

      // Check for node exist constraint
      let values = record.description.match(constraintNodeExistRegex);
      if (values && values.length > 1) {
        item = {
          on: 'Node',
          name: values[2],
          property: values[4],
          type: 'exist'
        }
      }

      // Check for node unique constraint
      values = record.description.match(constraintNodeUniqueRegex);
      if (values && values.length > 1) {
        item = {
          on: 'Node',
          name: values[2],
          property: values[4],
          type: 'unique'
        }
      }

      // Check for rel exist constraint
      values = record.description.match(constraintRelExistRegex);
      if (values && values.length > 1) {
        item = {
          on: 'Relationship',
          name: values[2],
          property: values[4],
          type: 'exist'
        }
      }

      // Check for node key
      values = record.description.match(constraintNodeKeyRegex);
      if (values && values.length > 1) {
        item = {
          on: 'Node',
          name: values[2],
          property: values[3].split(',').map(e => { return e.replace(values[1] + '.', '') }).join(','),
          type: 'key'
        }
      }

      return item;
    });
  }

  /**
   * Compute the schema of the graph.
   * @param {string} ignoredLabels A regex to define the labels to ignore
   * @param {string} ignoredTypes A regex to define the edge's types to ignore
   * @return {Promise<any>} The graph schema
   */
  schema = async (ignoredLabels: string = null, ignoredTypes: string = null): Promise<any> => {
    let schema = { nodes: [], edges: [] };

    const result = await this.cypher("CALL db.schema()");

    // compute nodes schema
    const nodes = result[0].nodes.filter(item => { return ignoredLabels ? !(new RegExp(ignoredLabels)).test(item.labels[0]) : true });
    const nodesSchema = await Promise.all(nodes.map(async (node) => {
      return await this.computeLabelSchema(node.labels[0]);
    }));
    schema.nodes = nodesSchema;

    // compute relationships schema
    const edges = result[0].relationships.filter(item => { return ignoredTypes ? !(new RegExp(ignoredTypes)).test(item.type) : true });
    const edgesSchema = await Promise.all(edges.map(async (edge) => {
      let startLabel = result[0].nodes.filter(item => { return item.identity === edge.start })[0].labels[0];
      let endLabel = result[0].nodes.filter(item => { return item.identity === edge.end })[0].labels[0];
      return await this.computeEdgeSchema(edge.type, startLabel, endLabel);
    }));
    schema.edges = edgesSchema;

    return schema;
  }

  private computeLabelSchema = async (label: string): Promise<any> => {
    let schema = { type: 'object', title: label, properties: {} };
    const result = await this.cypher(`MATCH (n:${label}) WITH n LIMIT 10 UNWIND keys(n) AS key RETURN DISTINCT key`);

    // compute props type
    const propsType = await Promise.all(result.map(async (row) => {
      return await this.computeNodePropertyType(label, row.key);
    }));

    propsType.forEach((prop) => {
      schema.properties[prop['title']] = prop;
    });

    return schema;
  }

  private computeEdgeSchema = async (edge: string, startLabel: string, endLabel: string): Promise<any> => {
    let schema = { type: 'object', title: edge, start: startLabel, end: endLabel, properties: {} };
    const result = await this.cypher(`MATCH (:${startLabel})-[r:${edge}]-(:${endLabel}) WITH r LIMIT 10  UNWIND keys(r) AS key RETURN DISTINCT key`);

    // compute props type
    const propsType = await Promise.all(result.map(async (row) => {
      return await this.computeEdgePropertyType(edge, startLabel, endLabel, row.key);
    }));

    propsType.forEach((prop) => {
      schema.properties[prop['title']] = prop;
    });

    return schema;
  }

  private computeNodePropertyType = async (label: string, property: string): Promise<any> => {
    let schema = { type: '', title: property };
    const result = await this.cypher(`MATCH (n:${label}) WHERE n.${property} IS NOT NULL RETURN DISTINCT n.${property} AS value LIMIT 10`);
    schema.type = this.computeTypeFromSampleResult(result);
    return schema;
  }

  private computeEdgePropertyType = async (edge: string, startLabel: string, endLabel: string, property: string): Promise<any> => {
    let schema = { type: '', title: property };
    const result = await this.cypher(`MATCH (:${startLabel})-[r:${edge}]->(:${endLabel}) WHERE r.${property} IS NOT NULL RETURN DISTINCT r.${property} AS value LIMIT 10`);
    schema.type = this.computeTypeFromSampleResult(result);
    return schema;
  }

  private convertObjectDriverToJs = (value: any): any => {
    let result: any = value;

    // Change Driver node to custom node
    if (value && value.hasOwnProperty('labels')) {
      result = { id: value.identity, labels: value.labels, properties: {} };
      Object.keys(value.properties).forEach(name => {
        result.properties[name] = value.properties[name];
      });
    }

    // Change Driver edge to custom edge
    if (value && value.hasOwnProperty('type')) {
      result = { id: value.identity, type: value.type, properties: {} };
      Object.keys(value.properties).forEach(name => {
        result.properties[name] = value.properties[name];
      });
    }

    // Change Driver Path to custom path
    if (value && value.hasOwnProperty('segments')) {
      result = [];
      if (value.length > 0) {
        result.push(this.convertObjectDriverToJs(value.start));
        value.segments.forEach((seg) => {
          result.push(this.convertObjectDriverToJs(seg.relationship));
          result.push(this.convertObjectDriverToJs(seg.end));
        });
      }
    }
    return result;
  }

  private computeTypeFromSampleResult = (result: any[]): string => {
    let finalType: string = 'string';

    const sampleCount = result
      // transform to an array of type
      .map((row) => {
        let type: string = typeof row.value;
        if (type === 'number') {
          if (Number.isInteger(row.value)) {
            type = "integer";
          }
        }
        if (type === 'object') {
          type = "array";
        }
        return type;
      })
      // tansform to a map with the counts
      .reduce((prev, current) => {
        if (prev[current]) {
          prev[current] += 1;
        } else {
          prev[current] = 1;
        }
        return prev;
      }, {})

    // searching the max
    Object.keys(sampleCount).forEach((key) => {
      if (sampleCount[key] > (sampleCount[finalType] | 0)) {
        finalType = key;
      }
    });

    return finalType;
  }

  close = () => {
    this.driver.close();
  }

}
