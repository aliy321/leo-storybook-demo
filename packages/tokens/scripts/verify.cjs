const fs = require('fs');
const path = require('path');

// Replace with your actual file path
const filePath = path.join(__dirname, '../tokens/modes.tokens.json');

// Read and parse JSON file
const tokens = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function flattenTheme(themeName, groupName, obj, parentPath = '') {
  const flat = {};

  for (const key in obj) {
    if (obj[key].$value !== undefined) {
      const pathStr = `${themeName}.${groupName}${parentPath ? '.' + parentPath : ''}.${key}`;
      flat[pathStr] = obj[key].$value;
    } else {
      // Nested object, recurse
      Object.assign(flat, flattenTheme(themeName, groupName, obj[key], parentPath ? parentPath + '.' + key : key));
    }
  }

  return flat;
}

function validateTokens(tokens) {
  const mismatches = [];
  for (const theme in tokens) {
    const groupMaps = {}; // { variablePath: { fullPath: value } }

    for (const group in tokens[theme]) {
      const flat = flattenTheme(theme, group, tokens[theme][group]);

      for (const fullPath in flat) {
        const varPath = fullPath.split('.').slice(2).join('.'); // ignore theme.group prefix
        if (!groupMaps[varPath]) groupMaps[varPath] = {};
        groupMaps[varPath][fullPath] = flat[fullPath];
      }
    }

    // Check mismatches
    for (const varPath in groupMaps) {
      const values = Object.values(groupMaps[varPath]);
      const firstValue = values[0];
      if (!values.every(v => v === firstValue)) {
        mismatches.push(Object.keys(groupMaps[varPath]));
      }
    }
  }

  return mismatches;
}

const result = validateTokens(tokens);
if (result.length === 0) {
  console.log('All variables are consistent across groups.');
} else {
  console.log('Mismatched variables found:');
  result.forEach(paths => {
    console.log(paths.join(', '));
  });
}
