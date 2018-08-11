import * as fs from 'fs';

export default class File {

  /**
   * Read the content of the file located at `filepath`.
   * @param {string} filepath : location of the file to read
   * @return {Promise<string>} The content of the file as a string
   */
  static read = async (filepath: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(filepath, { encoding: 'utf-8' }, (err, data) => {
        if (err)
          reject(err);
        resolve(data);
      });
    });
  }

  /**
   * Write the `data` in the file located at `filepath`.
   * @param {string} filepath : location of the file to write
   * @param {any} data : data to write
   * @return {Promise} a promise with an empty response if OK, otherwise the error.
   */
  static write = async (filepath: string, data: any) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, data, (err) => {
        if (err)
          reject(err);
        resolve();
      });
    });
  }

}
