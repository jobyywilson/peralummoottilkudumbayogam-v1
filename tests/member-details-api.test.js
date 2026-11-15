const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const memberId = '10D-1.1.2.4.2.2.1.1';

function loadHandler(name, data = []) {
  const calls = [];
  const exports = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../functions/${name}.js`), 'utf8'), {
    exports, console: { error() {} },
    require: name => name === './lib/family-api-config'
      ? { SUPABASE_API_KEY: 'configured-key', ENCRYPT_KEY: 'hf8685345fhjs9h' }
      : { get: async (url, options) => {
        calls.push({ url, options });
        if (data instanceof Error) throw data;
        return { data };
      } }
  });
  return { handler: exports.handler, calls };
}

function decrypt(body) {
  const key = 'hf8685345fhjs9h';
  return JSON.parse(Array.from(JSON.parse(body).data, (char, i) =>
    String.fromCharCode((char.charCodeAt(0) - key.charCodeAt(i % key.length) + 256) % 256)
  ).join(''));
}

for (const name of ['officeBearers', 'taggedPhotos']) {
  test(`${name}: returns encrypted records and uses shared credentials`, async () => {
    const records = name === 'officeBearers'
      ? [{ postion: 'Secretary', year: '2025-2026' }]
      : [{ photos: { big_photo_end_url: 'large.jpg', medium_photo_end_url: 'medium.jpg', small_photo_end_url: 'small.jpg' } }];
    const { handler, calls } = loadHandler(name, records);
    const result = await handler({ queryStringParameters: { memberId } });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(decrypt(result.body), records);
    assert.equal(calls[0].options.headers.apikey, 'configured-key');
    assert.equal(calls[0].options.timeout, 15000);
    const url = new URL(calls[0].url);
    assert.equal(url.searchParams.get(name === 'officeBearers' ? 'officeBearerUserId' : 'user_id'), `eq.${memberId}`);
    if (name === 'taggedPhotos') {
      assert.equal(url.searchParams.get('select'), 'photos:photo!public_photo_tag_photo_id_fkey(big_photo_end_url,medium_photo_end_url,small_photo_end_url)');
    }
  });

  test(`${name}: no matching records is a successful empty list`, async () => {
    const { handler } = loadHandler(name);
    const result = await handler({ queryStringParameters: { memberId } });
    assert.equal(result.statusCode, 200);
    assert.deepEqual(decrypt(result.body), []);
  });

  test(`${name}: rejects invalid member IDs without querying upstream`, async () => {
    const { handler, calls } = loadHandler(name);
    for (const invalid of ['', 'x&select=*', null, 123]) {
      assert.equal((await handler({ queryStringParameters: { memberId: invalid } })).statusCode, 400);
    }
    assert.equal(calls.length, 0);
  });

  test(`${name}: upstream errors return JSON without exposing internals`, async () => {
    const { handler } = loadHandler(name, new Error('private upstream failure'));
    const result = await handler({ queryStringParameters: { memberId } });
    assert.equal(result.statusCode, 502);
    assert.equal(result.headers['Content-Type'], 'application/json');
    assert.doesNotMatch(result.body, /private upstream failure/);
  });
}

test('officeBearers: requests without query parameters load the full list', async () => {
  const { handler, calls } = loadHandler('officeBearers');
  for (const event of [{}, { queryStringParameters: null }, { queryStringParameters: {} }]) {
    assert.equal((await handler(event)).statusCode, 200);
  }
  for (const call of calls) {
    const url = new URL(call.url);
    assert.equal(url.searchParams.get('select'), '*,user(mobile),year');
    assert.equal(url.searchParams.get('order'), 'year.desc');
    assert.equal(url.searchParams.has('officeBearerUserId'), false);
  }
});

test('taggedPhotos: missing member IDs return a validation error', async () => {
  const { handler, calls } = loadHandler('taggedPhotos');
  for (const event of [{}, { queryStringParameters: null }, { queryStringParameters: {} }]) {
    assert.equal((await handler(event)).statusCode, 400);
  }
  assert.equal(calls.length, 0);
});
