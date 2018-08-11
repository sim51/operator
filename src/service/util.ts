export default class Util {

  /**
   * Merge the strings line by line, (~ create columns)
   * @param {string[]} contents : The object to format
   * @return {string} The ascii representation
   */
  static mergeLineByLine(contents: string[]): string {
    const contentsByLine: string[][] = contents.map((content) => { return content.split('\n') });
    const maxLine: number = contentsByLine.reduce((prev, current) => {
      if (current.length > prev) {
        prev = current.length;
      } return prev;
    }, 0);


    let result = "";
    for (let i: number = 0; i < maxLine; i++) {
      contentsByLine.forEach((contentByLine) => {
        if (contentByLine.length > i) {
          result += contentByLine[i];
        }
        else {
          // TODO
          result += contentByLine[0].replace(/./g, ' ');
        }
        result += "  ";
      });
      if (i < (maxLine - 1))
        result += "\n";
    }

    return result;
  }

}
