const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadFunction(env = {}, response = []) {
  const configModule = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../functions/lib/family-api-config.js'), 'utf8'), {
    module: configModule, process: { env }
  });
  const config = configModule.exports;
  const calls = [];
  const functionModule = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../functions/relationship.js'), 'utf8'), {
    module: functionModule,
    exports: functionModule.exports,
    console: { error() {} },
    require: name => name === './lib/family-api-config' ? config : {
      get: async (url, options) => {
        calls.push({ url, options });
        if (response instanceof Error) throw response;
        return { data: response };
      }
    }
  });
  return { handler: functionModule.exports.handler, config, calls };
}

function decrypt(response, key) {
  const encrypted = JSON.parse(response.body).data;
  return JSON.parse(Array.from(encrypted, (char, i) =>
    String.fromCharCode((char.charCodeAt(0) - key.charCodeAt(i % key.length) + 256) % 256)
  ).join(''));
}

test('missing environment uses the browser public key and compatible encryption', async () => {
  const records = [{ spouse: { nodeId: '2X-1S', name: 'Unknown' } }];
  const { handler, config, calls } = loadFunction({}, records);
  const browserSource = fs.readFileSync(path.join(__dirname, '../src/app/service/supabase.service.ts'), 'utf8');
  assert.equal(config.SUPABASE_API_KEY, browserSource.match(/SUPABASE_API_KEY = '([^']+)'/)[1]);
  const result = await handler({ queryStringParameters: { memberId: '2X-1' } });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(decrypt(result, 'hf8685345fhjs9h8'), records);
  assert.match(calls[0].url, /primary_member_id=eq.2X-1&select=spouse:relationship_secondary_member_id_fkey/);
});

test('configured server credentials override defaults', async () => {
  for (const env of [
    { SUPABASE_ANON_KEY: 'anon-configured', ENCRYPT_KEY: 'custom' },
    { SUPABASE_API_KEY: 'server-configured', SUPABASE_ANON_KEY: 'anon-configured', ENCRYPT_KEY: 'custom' }
  ]) {
    const { handler, calls } = loadFunction(env, []);
    const result = await handler({ queryStringParameters: { memberId: '2X-1' } });
    assert.equal(calls[0].options.headers.apiKey, env.SUPABASE_API_KEY || env.SUPABASE_ANON_KEY);
    assert.deepEqual(decrypt(result, 'custom'), []);
  }
});

test('spouse and numbered spouse IDs load the other partner', async () => {
  for (const memberId of ['2X-1S', '2X-1S2']) {
    const { handler, calls } = loadFunction();
    assert.equal((await handler({ queryStringParameters: { memberId } })).statusCode, 200);
    assert.ok(calls[0].url.includes(`secondary_member_id=eq.${memberId}&select=spouse:relationship_primary_member_id_fkey`));
  }
});

test('all spouses are preserved in the panel response', async () => {
  const records = [
    { spouse: { nodeId: '2X-1S', name: 'First spouse' } },
    { spouse: { nodeId: '2X-1S2', name: 'Second spouse' } }
  ];
  const { handler, config } = loadFunction({}, records);
  assert.deepEqual(decrypt(await handler({ queryStringParameters: { memberId: '2X-1' } }), config.ENCRYPT_KEY), records);
});

test('missing or malformed member IDs do not query the API', async () => {
  const { handler, calls } = loadFunction();
  for (const event of [{}, { queryStringParameters: {} }, { queryStringParameters: { memberId: 'x&select=*' } }]) {
    assert.equal((await handler(event)).statusCode, 400);
  }
  assert.equal(calls.length, 0);
});

test('upstream failures return a controlled error', async () => {
  const { handler } = loadFunction({}, new Error('Upstream unavailable'));
  const result = await handler({ queryStringParameters: { memberId: '2X-1' } });
  assert.equal(result.statusCode, 502);
  assert.deepEqual(JSON.parse(result.body), { error: 'Unable to load spouse details.' });
});
