import Util from './util';
import test from 'ava';

test('Merge contents by line should work', async (t) => {
  const result = Util.mergeLineByLine(["| a |\n| b |\n| c |\n| d |", "| 1 |\n| 2 |\n| 3 |"]);
  t.is(result.split('\n').length, 4);
});
