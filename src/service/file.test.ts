import * as os from 'os';
import * as path from 'path';

import File from './file';
import test from 'ava';

test('Read a valid file should work', async (t) => {
  const content = await File.read('./package.json');
  t.is(JSON.parse(content).name, 'operator');
});

test('Read a not existing file should fail', async (t) => {
  try {
    const content = await File.read('./QWERTYUIOP');
    t.fail('If this line is executed, no error has benn throwned');
  }
  catch (e) {
    t.true(e.message.includes('no such file or directory'))
  }
});

test('Write a file should work', async (t) => {
  const filename: string = Date.now().toString();
  const filePath = path.normalize(path.join(os.tmpdir(), `/${filename}`));
  try {
    const rs = await File.write(filePath, filename);
    const content = await File.read(filePath);
    t.is(content, filename);
  }
  catch (e) {
    t.fail();
  }
});
