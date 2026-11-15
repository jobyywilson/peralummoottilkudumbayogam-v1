const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadComponent(file, name) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true }
  }).outputText;
  vm.runInNewContext(source, {
    exports,
    require: () => new Proxy({}, { get: () => () => () => {} })
  });
  return exports[name];
}
const Chart = loadComponent('src/app/custom/d3-org-chart/d3-org-chart.component.ts', 'D3OrgChartComponent');
function makeChart() {
  return new Chart({ getUserPhotos: url => url || 'default.png' }, {}, {});
}

test('node width fits no spouse, one spouse, multiple spouses and unknown co-parent', () => {
  const chart = makeChart();
  assert.equal(chart.getNodeWidth({ data: {} }), 120);
  assert.equal(chart.getNodeWidth({ data: { spouse: 'Anna' } }), 240);
  assert.equal(chart.getNodeWidth({ data: { spouseList: ['Anna', 'Mary', 'Jane'] } }), 480);
  assert.equal(chart.getNodeWidth({ data: {}, children: [{}] }), 240);
});

test('multiple spouse names never guess profile IDs or reuse the last spouse photo', () => {
  const cards = makeChart().getSpouseCards({ nodeId: 'A', spouseList: ['Anna', 'Mary'], spousePic: 'mary.jpg' });
  assert.equal(cards.length, 2);
  assert.equal(cards[0].name, 'Anna');
  assert.equal(cards[1].name, 'Mary');
  assert.equal(cards[0].nodeId, undefined);
  assert.equal(cards[1].profilePic, undefined);
});

test('renders every spouse with escaped names and separate photos and IDs', () => {
  const component = makeChart();
  const spouses = [
    { nodeId: 'AS2', name: 'Anna & Mary', profilePic: 'anna.jpg' },
    { nodeId: 'AS', name: '<Jane>', profilePic: 'jane.jpg' }
  ];
  let render;
  const chart = new Proxy({}, {
    get: (_, key) => {
      if (key === 'getChartState') return () => ({ svg: { on() {} } });
      return (...args) => { if (key === 'nodeContent') render = args[0]; return chart; };
    }
  });
  component.chart = chart;
  component.chartContainer = { nativeElement: {} };
  component.data = [{ nodeId: 'A', name: 'Member', spouses }];
  component.updateLink = () => {};
  component.updateChart();
  const html = render({ data: component.data[0], width: 360, height: 180 });
  assert.equal((html.match(/class="spouse-card"/g) || []).length, 2);
  assert.ok(html.includes('Anna &amp; Mary'));
  assert.ok(html.includes('&lt;Jane&gt;'));
  assert.ok(html.includes('anna.jpg'));
  assert.ok(html.includes('jane.jpg'));
  assert.equal(component.getSpouseCards(component.data[0])[0].nodeId, 'AS2');
});
