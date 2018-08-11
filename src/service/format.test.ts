import Format from './format';
import test from 'ava';

//
// Test for ASCII table
//

test('Convert an array of JS object to an ascci table should work', async (t) => {
  const result = Format.toAsciiTable(
    [
      { string: 'a', integer: 1, boolean: true },
      { string: 'b', integer: 2, boolean: false }
    ]
  );
  t.is(result.split('\n').length, 6);
});

test('Convert an empty string to an ascci table should return an empty string', async (t) => {
  const result = Format.toAsciiTable('');
  t.is(result, '');
});

test('Convert a string to an ascci table should return the string', async (t) => {
  const result = Format.toAsciiTable('Test');
  t.is(result, 'Test');
});

test('Convert an array of string to an ascci table should work', async (t) => {
  const result = Format.toAsciiTable(['a', 'b', 'c', 'd']);
  t.is(result.split('\n').length, 6);
});

test('Convert an array of number to an ascci table should work', async (t) => {
  const result = Format.toAsciiTable([1, 2, 3, 4]);
  t.is(result.split('\n').length, 6);
});

test('Convert a JSON object to an ascci table should work', async (t) => {
  const result = Format.toAsciiTable({ col1: 'qwertyu', col2: 'asdfghj', col3: 1, col4: true });
  t.is(result.split('\n').length, 5);
});

//
// Test for JSON
//

test('Convert an array of JS object to JSON should work', async (t) => {
  const result = Format.toJson(
    [
      { string: 'a', integer: 1, boolean: true },
      { string: 'b', integer: 2, boolean: false }
    ]
  );
  t.is(result.split('\n').length, 12);
});

test('Convert an empty string to JSON should return an empty string', async (t) => {
  const result = Format.toJson('');
  t.is(result, '');
});

test('Convert a string to JSON should return the string', async (t) => {
  const result = Format.toJson('Test');
  t.is(result, '"Test"');
});

test('Convert an array of string to JSON should work', async (t) => {
  const result = Format.toJson(['a', 'b', 'c', 'd']);
  t.is(result.split('\n').length, 6);
});

test('Convert an array of number to JSON should work', async (t) => {
  const result = Format.toJson([1, 2, 3, 4]);
  t.is(result.split('\n').length, 6);
});

test('Convert a JSON object to JSON should work', async (t) => {
  const result = Format.toJson({ col1: 'qwertyu', col2: 'asdfghj', col3: 1, col4: true });
  t.is(result.split('\n').length, 6);
});

//
// Test for CSV
//

test('Convert an array of JS object to CSV should work', async (t) => {
  const result = Format.toCsv(
    [
      { string: 'a', integer: 1, boolean: true },
      { string: 'b', integer: 2, boolean: false }
    ]
  );
  t.is(result.split('\n').length, 3);
});

test('Convert an empty string to CSV should return an empty string', async (t) => {
  const result = Format.toCsv('');
  t.is(result, '');
});

test('Convert a string to CSV should return the string', async (t) => {
  const result = Format.toCsv('Test');
  t.is(result, '"Test"');
});

test('Convert an array of string to CSV should work', async (t) => {
  const result = Format.toCsv(['a', 'b', 'c', 'd']);
  t.is(result.split('\n').length, 4);
});

test('Convert an array of number to CSV should work', async (t) => {
  const result = Format.toCsv([1, 2, 3, 4]);
  t.is(result.split('\n').length, 4);
});

test('Convert a JSON object to CSV should work', async (t) => {
  const result = Format.toCsv({ col1: 'qwertyu', col2: 'asdfghj', col3: 1, col4: true });
  t.is(result.split('\n').length, 2);
});
