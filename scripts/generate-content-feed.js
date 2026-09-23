const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(projectRoot, 'src', 'assets', 'content');
const outputPath = path.join(projectRoot, 'src', 'assets', 'data', 'content-feed.json');
const contentTypes = ['events', 'posts', 'obituaries'];

const items = [];

for (const type of contentTypes) {
  const directory = path.join(contentRoot, type);

  if (!fs.existsSync(directory)) {
    continue;
  }

  const fileNames = fs.readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort((left, right) => left.localeCompare(right));

  for (const fileName of fileNames) {
    const absolutePath = path.join(directory, fileName);
    const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

    items.push({
      type,
      path: `src/assets/content/${type}/${fileName}`,
      data
    });
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify({ items }, null, 2)}\n`);

console.log(`Generated content feed with ${items.length} items.`);
