const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

function toPascalCase(kebab) {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toStencilClassName(kebab) {
  return `Leo${toPascalCase(kebab)}`;
}

function toEventName(kebab) {
  return `leo${toPascalCase(kebab)}Click`;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function insertAfterLastMatch(content, pattern, insertion) {
  const matches = [...content.matchAll(pattern)];
  if (matches.length === 0) {
    throw new Error(`Could not find insertion point for pattern: ${pattern}`);
  }
  const last = matches[matches.length - 1];
  const index = last.index + last[0].length;
  return content.slice(0, index) + insertion + content.slice(index);
}

function patchUiPackageJson(name) {
  const filePath = path.join(repoRoot, 'packages/ui/package.json');
  const pkg = JSON.parse(readText(filePath));
  const exportKey = `./${name}`;

  if (pkg.exports[exportKey]) {
    return `packages/ui/package.json already exports ./${name}`;
  }

  pkg.exports[exportKey] = {
    types: `./dist/${name}/index.d.ts`,
    import: `./dist/${name}/index.js`,
    default: `./dist/${name}/index.js`,
  };

  writeText(filePath, `${JSON.stringify(pkg, null, 2)}\n`);
  return `Added @leo/ui/${name} export`;
}

function patchUiIndex(name) {
  const filePath = path.join(repoRoot, 'packages/ui/src/index.ts');
  let content = readText(filePath);
  const line = `export * from './${name}';`;

  if (content.includes(line)) {
    return 'packages/ui/src/index.ts already exports component';
  }

  content = `${content.trimEnd()}\n${line}\n`;
  writeText(filePath, content);
  return `Added export to packages/ui/src/index.ts`;
}

function patchStencilConfig(name) {
  const filePath = path.join(repoRoot, 'tooling/web/stencil.config.ts');
  let content = readText(filePath);
  const packageLine = `  '@leo/ui/${name}': path.resolve(__dirname, '../../packages/ui/dist/${name}/index.js'),`;
  const watchLine = `  path.resolve(__dirname, '../../packages/ui/dist/${name}/core/${name}.core.js'),`;

  if (!content.includes(`'@leo/ui/${name}'`)) {
    content = insertAfterLastMatch(
      content,
      /  '@leo\/ui\/[^']+': path\.resolve\(__dirname, '\.\.\/\.\.\/packages\/ui\/dist\/[^']+'\),\n/g,
      `\n${packageLine}`,
    );
  }

  if (!content.includes(`/dist/${name}/core/${name}.core.js`)) {
    content = insertAfterLastMatch(
      content,
      /  path\.resolve\(__dirname, '\.\.\/\.\.\/packages\/ui\/dist\/[^']+'\),\n/g,
      `\n${watchLine}`,
    );
  }

  writeText(filePath, content);
  return `Updated tooling/web/stencil.config.ts`;
}

function patchWebTsconfig(name) {
  const filePath = path.join(repoRoot, 'tooling/web/tsconfig.json');
  const json = JSON.parse(readText(filePath));
  const pathKey = `@leo/ui/${name}`;
  const pathValue = [`../../packages/ui/src/${name}/index.ts`];

  if (!json.compilerOptions.paths[pathKey]) {
    json.compilerOptions.paths[pathKey] = pathValue;
    writeText(filePath, `${JSON.stringify(json, null, 2)}\n`);
    return `Updated tooling/web/tsconfig.json paths`;
  }

  return 'tooling/web/tsconfig.json already has path alias';
}

function patchStorybookWeb(name) {
  const filePath = path.join(repoRoot, 'apps/storybook-web/.storybook/main.ts');
  let content = readText(filePath);

  const storyLines = [
    `    '../../../packages/ui/src/${name}/web/${name}.stories.ts',`,
    `    '../../../packages/ui/src/${name}/docs/${name}.docs.mdx',`,
  ];
  const aliasLine = `      '@leo/ui/${name}': resolve(__dirname, '../../../packages/ui/src/${name}/index.ts'),`;

  for (const line of storyLines) {
    if (!content.includes(line.trim())) {
      content = insertAfterLastMatch(
        content,
        /    '\.\.\/\.\.\/\.\.\/packages\/ui\/src\/[^']+',\n/g,
        `\n${line}`,
      );
    }
  }

  if (!content.includes(`'@leo/ui/${name}'`)) {
    content = insertAfterLastMatch(
      content,
      /      '@leo\/ui\/[^']+': resolve\(__dirname, '\.\.\/\.\.\/\.\.\/packages\/ui\/src\/[^']+'\),\n/g,
      `\n${aliasLine}`,
    );
  }

  writeText(filePath, content);
  return `Updated apps/storybook-web/.storybook/main.ts`;
}

function patchStorybookNative(name) {
  const filePath = path.join(repoRoot, 'apps/storybook-native/.storybook/main.ts');
  let content = readText(filePath);

  const storyLines = [
    `    '../../../packages/ui/src/${name}/native/${name}.stories.tsx',`,
    `    '../../../packages/ui/src/${name}/docs/${name}.docs.native.mdx',`,
  ];
  const aliasLine = `      '@leo/ui/${name}': path.resolve(__dirname, '../../../packages/ui/src/${name}/index.ts'),`;

  for (const line of storyLines) {
    if (!content.includes(line.trim())) {
      content = insertAfterLastMatch(
        content,
        /    '\.\.\/\.\.\/\.\.\/packages\/ui\/src\/[^']+',\n/g,
        `\n${line}`,
      );
    }
  }

  if (!content.includes(`'@leo/ui/${name}'`)) {
    content = insertAfterLastMatch(
      content,
      /      '@leo\/ui\/[^']+': path\.resolve\(__dirname, '\.\.\/\.\.\/\.\.\/packages\/ui\/src\/[^']+'\),\n/g,
      `\n${aliasLine}`,
    );
  }

  writeText(filePath, content);
  return `Updated apps/storybook-native/.storybook/main.ts`;
}

function patchToolingConfigs(name) {
  const results = [
    patchUiPackageJson(name),
    patchUiIndex(name),
    patchStencilConfig(name),
    patchWebTsconfig(name),
    patchStorybookWeb(name),
    patchStorybookNative(name),
  ];
  return results.join('\n  - ');
}

/**
 * @param {import('plop').NodePlopAPI} plop
 */
module.exports = function plopfile(plop) {
  plop.setHelper('pascalCase', (text) => toPascalCase(text));
  plop.setHelper('stencilClass', (text) => toStencilClassName(text));
  plop.setHelper('eventName', (text) => toEventName(text));
  plop.setHelper('tag', (text) => `leo-${text}`);

  plop.setGenerator('component', {
    description: 'Scaffold a new @leo/ui component (core, web, native, docs)',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Component name (kebab-case, e.g. badge):',
        validate: (value) => {
          if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value)) {
            return 'Use kebab-case (letters, numbers, hyphens; start with a letter).';
          }
          const componentDir = path.join(repoRoot, 'packages/ui/src', value);
          if (fs.existsSync(componentDir)) {
            return `packages/ui/src/${value}/ already exists.`;
          }
          return true;
        },
      },
    ],
    actions: (data) => {
      data.PascalName = toPascalCase(data.name);
      data.StencilClass = toStencilClassName(data.name);
      data.EventName = toEventName(data.name);
      data.tag = `leo-${data.name}`;
      data.storiesBinding = `{${toPascalCase(data.name)}Stories}`;
      data.storiesName = `${toPascalCase(data.name)}Stories`;

      return [
        {
          type: 'addMany',
          destination: '../../packages/ui/src/{{name}}',
          base: 'component',
          templateFiles: 'component/**/*',
          globOptions: { dot: true },
        },
        (answers) => {
          const summary = patchToolingConfigs(answers.name);
          return `Patched tooling configs:\n  - ${summary}`;
        },
      ];
    },
  });
};
