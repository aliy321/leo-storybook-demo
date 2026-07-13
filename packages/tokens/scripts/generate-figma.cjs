const fs = require('fs');
const path = require('path');
const { createFigmaSnapshot, loadTokenModel } = require('./token-model.cjs');

const outputPath = path.join(__dirname, '../dist/figma.variables.json');

try {
  const snapshot = createFigmaSnapshot(loadTokenModel());
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  const variableCount = snapshot.collections.reduce(
    (count, collection) => count + collection.variables.length,
    0,
  );
  console.log(
    `Generated Figma snapshot: ${snapshot.collections.length} collections, ${variableCount} variables at ${outputPath}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
