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
  assert.equal(chart.getNodeWidth({ data: {} }), 160);
  assert.equal(chart.getNodeWidth({ data: { spouse: 'Anna' } }), 360);
  assert.equal(chart.getNodeWidth({ data: { spouseList: ['Anna', 'Mary', 'Jane'] } }), 760);
  assert.equal(chart.getNodeWidth({ data: {}, children: [{}] }), 360);
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


test('child of the third spouse anchors to that spouse without duplicating the member', () => {
  const chart = makeChart();
  const parent = { nodeId: 'A', name: 'Alex', spouses: [
    { nodeId: 'AS', name: 'Anna' }, { nodeId: 'AS1', name: 'Beth' }, { nodeId: 'AS2', name: 'Clara' }
  ] };
  const child = { nodeId: 'B', name: 'Eva', parentNodeId: 'A', secondaryParentMemberId: 'AS2' };
  chart.data = [parent, child];
  assert.equal(chart.getParentPair(child).label, 'Alex & Clara');
  assert.equal(chart.getParentLinkX({ data: child, parent: { x: 380, width: 760 } }), 580);
  assert.equal(chart.getChartData().filter(item => item.nodeId === 'A').length, 1);
});

test('unknown co-parent stays unknown and sibling groups follow spouse order', () => {
  const chart = makeChart();
  const parent = { nodeId: 'A', name: 'Alex', spouses: [{ nodeId: 'AS', name: 'Anna' }, { nodeId: 'AS1', name: 'Beth' }] };
  const first = { nodeId: 'B', parentNodeId: 'A', secondaryParentMemberId: 'AS' };
  const second = { nodeId: 'C', parentNodeId: 'A', secondaryParentMemberId: 'AS1' };
  const unknown = { nodeId: 'D', parentNodeId: 'A' };
  chart.data = [parent, second, unknown, first];
  assert.equal(chart.getParentPair(unknown).index, -1);
  assert.match(chart.getParentPair(unknown).label, /Other parent not recorded/);
  assert.deepEqual(Array.from(chart.getChartData(), item => item.nodeId), ['A', 'B', 'C', 'D']);
});

test('wide child groups stay separated while adult cards remain compact', () => {
  const chart = makeChart();
  const parent = { nodeId: 'A', name: 'Alex', spouses: [
    { nodeId: 'AS', name: 'Anna' }, { nodeId: 'AS1', name: 'Beth' }, { nodeId: 'AS2', name: 'Clara' }
  ] };
  const children = ['AS', 'AS', 'AS1', 'AS2'].map((spouse, i) => ({
    data: { nodeId: `C${i}`, parentNodeId: 'A', secondaryParentMemberId: spouse }, width: 160
  }));
  chart.data = [parent, ...children.map(child => child.data)];
  const root = { data: parent, children, width: 760 };
  children.forEach(child => { child.parent = root; });
  chart.layoutParentGroups(root);
  const spouseCenter = index => root.x - root.width / 2 + chart.getFamilyAnchorX(root, index + 1);
  assert.equal(root.width, 760);
  assert.deepEqual(Array.from(root.familyColumns), [160, 160, 160, 160]);
  assert.ok(children[1].x + children[1].width / 2 < children[2].x - children[2].width / 2);
  assert.equal(chart.getParentLinkX(children[3]), spouseCenter(2));
  // A fresh layout after collapse must release the extra column width.
  root.children = [children[3]];
  chart.layoutParentGroups(root);
  assert.equal(root.width, 760);
});

test('expand control sits in the gap before Anitta at the partner line, expanded or collapsed', () => {
  const chart = makeChart();
  const parent = { nodeId: 'A', name: 'Roja', spouses: [{ nodeId: 'AS', name: 'Ann' }, { nodeId: 'AS1', name: 'Anitta' }] };
  const child = { data: { nodeId: 'B', parentNodeId: 'A', secondaryParentMemberId: 'AS1' }, width: 160 };
  chart.data = [parent, child.data];
  const node = { data: parent, children: [child], width: 560, height: 200 };
  chart.layoutParentGroups(node);
  assert.equal(chart.getExpandButtonX(node), chart.getCardCenter(node, 2) - chart.cardWidth / 2 - chart.cardGap / 2);
  assert.equal(chart.getExpandButtonY(node), 100);
  assert.equal(child.x, node.x - node.width / 2 + chart.getExpandButtonX(node));
  child.parent = node;
  assert.equal(chart.getParentLinkX(child), child.x);
  node._children = node.children;
  node.children = null;
  assert.equal(chart.getExpandButtonX(node), chart.getCardCenter(node, 2) - chart.cardWidth / 2 - chart.cardGap / 2);
});

const FamilyTree = loadComponent('src/app/family-tree/family-tree.component.ts', 'FamilyTreeComponent');

test('legacy spouse child lists recover parentage when child summaries omit the co-parent ID', () => {
  const responses = {
    '/.netlify/functions/users/AS': [{ nodeId: 'AS', childrens: [] }],
    '/.netlify/functions/users/AS1': [{ nodeId: 'AS1', childrens: [{ nodeId: 'B', name: 'Rihanna' }, { nodeId: 'C' }] }]
  };
  const requests = [];
  const treeComponent = new FamilyTree({
    doGet: url => ({ subscribe: observer => { requests.push(url); observer.next({ data: responses[url] }); } })
  }, { decryptAndParse: value => value }, { snapshot: { paramMap: null } }, {});
  const parent = { nodeId: 'A', name: 'Roja', spouses: [{ nodeId: 'AS', name: 'Ann' }, { nodeId: 'AS1', name: 'Anitta' }] };
  const child = { nodeId: 'B', name: 'Rihanna', parentNodeId: 'A' };
  const unrelated = { nodeId: 'C', parentNodeId: 'OtherMember' };
  treeComponent.loadSpouseChildren(parent, [parent, child, unrelated]);
  assert.equal(requests.length, 2);
  assert.equal(child.secondaryParentMemberId, 'AS1');
  assert.equal(unrelated.secondaryParentMemberId, undefined);
  const chart = makeChart();
  chart.data = treeComponent.data;
  assert.equal(chart.getParentPair(child).index, 1);
  const childNode = { data: child, width: 160 };
  const root = { data: parent, children: [childNode], height: 200 };
  childNode.parent = root;
  chart.layoutParentGroups(root);
  assert.equal(chart.getParentLinkX(childNode), childNode.x);
  assert.equal(childNode.x, root.x - root.width / 2 + chart.getExpandButtonX(root));
});

function hierarchy(chart, id) {
  function build(record, parent, depth) {
    const node = { data: record, parent, y: depth * 290, height: 200 };
    const children = chart.data.filter(item => item.parentNodeId === record.nodeId).map(item => build(item, node, depth + 1));
    if (children.length) node.children = children;
    return node;
  }
  return build(chart.data.find(item => item.nodeId === id), null, 0);
}

function verifyGeometry(chart, root) {
  chart.layoutParentGroups(root);
  const nodes = [];
  function walk(node) { nodes.push(node); (node.children || []).forEach(walk); }
  walk(root);
  const cards = nodes.flatMap(node => node.familyColumns.map((_, i) => ({
    id: node.data.nodeId, left: node.x - node.width / 2 + chart.getCardCenter(node, i) - 80,
    right: node.x - node.width / 2 + chart.getCardCenter(node, i) + 80,
    top: node.y, bottom: node.y + 200
  })));
  for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
    const a = cards[i], b = cards[j];
    assert.ok(!(a.left < b.right - 0.01 && a.right > b.left + 0.01 && a.top < b.bottom && a.bottom > b.top), `cards overlap: ${a.id} / ${b.id}`);
  }
  for (const node of nodes.filter(item => item.parent)) {
    const source = { x: chart.getParentLinkX(node), y: chart.getParentLinkY(node) };
    const target = { x: node.x - node.width / 2 + chart.getCardCenter(node, 0), y: node.y };
    const path = chart.getFamilyLinkPath(target, source);
    const numbers = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
    assert.ok(numbers.every(Number.isFinite));
    const bendY = numbers[2];
    assert.ok(bendY >= node.parent.y + node.parent.height, `branch bends inside adult row: ${node.data.nodeId}`);
    const points = [source, { x: source.x, y: bendY }, { x: target.x, y: bendY }, target];
    for (let i = 1; i < points.length; i++) for (const card of cards) {
      const a = points[i - 1], b = points[i];
      const intersects = a.x === b.x
        ? a.x > card.left + 0.01 && a.x < card.right - 0.01 && Math.max(a.y, b.y) > card.top + 0.01 && Math.min(a.y, b.y) < card.bottom - 0.01
        : a.y > card.top + 0.01 && a.y < card.bottom - 0.01 && Math.max(a.x, b.x) > card.left + 0.01 && Math.min(a.x, b.x) < card.right - 0.01;
      assert.ok(!intersects, `connector to ${node.data.nodeId} crosses card ${card.id}`);
    }
  }
  return nodes;
}

for (const [name, id] of [['C T Thomas', '8C-1.7.3.1.3.2'], ['Roja', '10C-1.1.2.1.2.2.1.1']]) {
  test(`real ${name} family: compact partners, no card overlaps or connectors through cards`, () => {
    const chart = makeChart();
    chart.data = require('./fixtures/family-layout.json');
    const root = hierarchy(chart, id);
    const expanded = verifyGeometry(chart, root).map(node => [node.data.nodeId, node.x, node.width]);
    assert.equal(root.width, 560);
    assert.equal(chart.getCardCenter(root, 1) - chart.getCardCenter(root, 0), 200);
    root._children = root.children;
    root.children = null;
    verifyGeometry(chart, root);
    assert.equal(root.width, 560);
    root.children = root._children;
    root._children = null;
    assert.deepEqual(verifyGeometry(chart, root).map(node => [node.data.nodeId, node.x, node.width]), expanded);
  });
}

test('three-spouse stress cases: wide siblings, grandchildren, and missing co-parent links', () => {
  for (let scenario = 0; scenario < 30; scenario++) {
    const chart = makeChart();
    const parent = { nodeId: 'A', name: 'Member', spouses: [0, 1, 2].map(i => ({ nodeId: `AS${i}`, name: `Partner ${i}` })) };
    chart.data = [parent];
    for (let i = 0; i < 6 + scenario; i++) {
      const child = { nodeId: `C${i}`, parentNodeId: 'A', name: 'Child', secondaryParentMemberId: i % 5 ? `AS${(i + scenario) % 3}` : undefined, spouse: i % 2 ? 'Partner' : '' };
      chart.data.push(child);
      for (let j = 0; j < (i + scenario) % 4; j++) chart.data.push({ nodeId: `G${i}-${j}`, parentNodeId: child.nodeId, name: 'Grandchild' });
    }
    const root = hierarchy(chart, 'A');
    verifyGeometry(chart, root);
    assert.equal(root.width, 760);
  }
});
