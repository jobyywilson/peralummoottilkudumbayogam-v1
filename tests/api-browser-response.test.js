const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function component(file, name, imports = {}) {
  const exports = {};
  const angular = { Injectable: () => value => value, Component: () => value => value };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText, { exports, require: name => imports[name] || angular });
  return exports[name];
}
const Crypto = component('src/app/service/crypto.service.ts', 'CryptoService');

function api(name, records, env = {}) {
  const config = { exports: {} };
  vm.runInNewContext(fs.readFileSync('functions/lib/family-api-config.js', 'utf8'), {
    module: config, process: { env }
  });
  const exports = {};
  vm.runInNewContext(fs.readFileSync(`functions/${name}.js`, 'utf8'), {
    exports, console: { error() {} },
    require: name => name === './lib/family-api-config' ? config.exports : { get: async () => ({ data: records }) }
  });
  return { handler: exports.handler, config: config.exports };
}

const records = [{
  nodeid: 'A', name: 'മറിയാമ്മ Ŝq 😀', parentnodeid: null,
  about: 'Quotes " and backslashes \\ with newline\n and tab\t', spouse: null
}];

for (const name of ['users', 'relationship', 'officeBearers', 'taggedPhotos']) {
  for (const legacy of [false, true]) {
    test(`${name}: real API response decodes in browser, Unicode intact (${legacy ? 'legacy key' : 'default key'})`, async () => {
      const { handler, config } = api(name, records, legacy ? { ENCRYPT_KEY: 'hf8685345fhjs9h' } : {});
      const browser = new Crypto();
      if (!legacy) assert.equal(config.ENCRYPT_KEY, browser.key);
      const response = await handler({ queryStringParameters: { memberId: 'A' } });
      assert.equal(response.statusCode, 200);
      assert.equal(JSON.stringify(browser.decryptAndParse(JSON.parse(response.body).data)), JSON.stringify(records));
    });
  }
}

test('the Unicode serializer prevents a literal backslash from becoming an invalid JSON escape', () => {
  const { config } = api('users', []);
  const browser = new Crypto();
  // U+015C used to be truncated to U+005C (backslash) by the byte cipher.
  assert.equal(browser.decryptAndParse(browser.encrypt(config.serializeFamilyData({ name: 'Ŝq' }))).name, 'Ŝq');
});

test('malformed responses fail explicitly without deleting control characters or altering JSON', () => {
  const browser = new Crypto();
  for (const value of [undefined, '', browser.encrypt('{"name":"\\q"}'), browser.encrypt('{"name":"bad\nvalue"}')]) {
    assert.throws(() => browser.decryptAndParse(value), /missing|Unable to decode/);
  }
});

test('family tree consumes the real users response and catches decoding failures', async () => {
  const { handler } = api('users', records);
  let response = JSON.parse((await handler({})).body);
  const Tree = component('src/app/family-tree/family-tree.component.ts', 'FamilyTreeComponent', {
    d3: { json: async () => response }
  });
  const tree = new Tree({}, new Crypto(), { snapshot: { paramMap: null } }, { getUserPhotoUrl: () => ({}) });
  await tree.loadTree('/.netlify/functions/users');
  assert.equal(tree.data[0].name, records[0].name);
  assert.equal(tree.loadError, '');
  response = { data: 'invalid' };
  await tree.loadTree('/.netlify/functions/users');
  assert.match(tree.loadError, /Unable to load/);
  assert.equal(tree.data.length, 0);
  response = JSON.parse((await handler({})).body);
  await tree.loadTree('/.netlify/functions/users');
  assert.equal(tree.loadError, '');
  assert.equal(tree.data.length, 1);
});
