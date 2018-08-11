import * as AsciiTable from 'ascii-table';
import * as json2csv from 'json2csv';

export default class Format {

  /**
   * Convert the `object` to an ascii table.
   * @param {any} object : The object to format
   * @return {string} The ascii representation of the array
   */
  static toAsciiTable = (object: any, title: string = ''): string => {
    let result: string = object.toString();

    // if object is an array
    if (Array.isArray(object) && object.length > 0) {
      let table = new AsciiTable();
      if (title !== '') {
        table.setTitle(title);
      }
      if (typeof object[0] === 'object') {
        const headers = Object.keys(object[0]);
        table.setHeading(headers);
        object.forEach((item) => {
          let row = [];
          for (let key in headers) {
            row.push(JSON.stringify(item[headers[key]]));
          }
          table.addRow(row);
        });
      }
      else {
        object.forEach((item) => {
          table.addRow(item);
        });
      }
      result = table.toString();
    }
    else {
      // if object is an object
      if (typeof object === 'object') {
        let table = new AsciiTable();
        if (title !== '') {
          table.setTitle(title);
        }
        const headers = Object.keys(object);
        table.setHeading(headers);
        let row = []
        Object.keys(object).forEach((key) => {
          row.push(object[key]);
        })
        table.addRow(row);
        result = table.toString();
      }
    }

    return result;
  }

  /**
   * Display the given `object` as a string in JSON format.
   * @param {object} object : the object to display
   * @return {string} the prettify JSON reprensentation of the object
   */
  static toJson = (object: any): string => {
    let result = JSON.stringify(object, null, 2);
    if (result === '""') {
      return '';
    }
    return result;
  }

  /**
   * Display the given `object` as a string in csv format.
   * @param {object} object : the object to display
   * @return {string} the csv reprensentation of the object
   */
  static toCsv = (object: any): string => {
    let result = '';
    try {
      result = json2csv.parse(object);
    }
    catch (e) {
      // simple array
      if (Array.isArray(object) && object.length > 0) {
        result = object.join('\n');
      }
      if (typeof object === 'string') {
        result = JSON.stringify(object);
      }
      if (result === '""') {
        result = '';
      }
    }

    return result;
  }

}
