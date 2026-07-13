const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '../tokens');
const COMPONENT_TOKENS_PATH = path.join(TOKENS_DIR, 'component-tokens.json');
const MODES_PATH = path.join(TOKENS_DIR, 'modes.tokens.json');
const PRIMITIVES_PATH = path.join(TOKENS_DIR, 'primitives.tokens.json');

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required token file does not exist: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to parse token JSON at ${filePath}: ${error.message}`);
  }
}

function flattenModeValues(value, result) {
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    if (!child || typeof child !== 'object') continue;

    if (Object.prototype.hasOwnProperty.call(child, '$value')) {
      result[key] = child.$value;
      continue;
    }

    flattenModeValues(child, result);
  }

  return result;
}

function flattenPrimitiveLeaves(value, segments, result) {
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith('$')) continue;
    if (!child || typeof child !== 'object') continue;

    const nextSegments = [...segments, key];
    if (Object.prototype.hasOwnProperty.call(child, '$value')) {
      result.push({
        path: nextSegments,
        value: child.$value,
        type: child.$type,
      });
      continue;
    }

    flattenPrimitiveLeaves(child, nextSegments, result);
  }

  return result;
}

function normalizeColor(value) {
  return String(value).replace(/\s+/g, '').toLowerCase();
}

function colorToFigma(value) {
  const color = String(value).trim();
  const hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hex) {
    return {
      r: parseInt(hex[1], 16) / 255,
      g: parseInt(hex[2], 16) / 255,
      b: parseInt(hex[3], 16) / 255,
      a: 1,
    };
  }

  const rgba = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]) / 255,
      g: Number(rgba[2]) / 255,
      b: Number(rgba[3]) / 255,
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  throw new Error(`Unsupported Figma color value: ${value}`);
}

function variableScopesForRole(role) {
  if (role.includes('foreground')) return ['TEXT_FILL'];
  if (role === 'border' || role === 'input' || role === 'ring') return ['STROKE_COLOR'];
  return ['FRAME_FILL', 'SHAPE_FILL'];
}

function primitiveVariableName(leaf) {
  const [category, ...rest] = leaf.path;
  if (category === 'colours' || category === 'colors') {
    return `color/${rest.join('/')}`;
  }
  if (category === 'spacing') {
    return `dimension/spacing/${rest.join('/')}`;
  }
  if (category === 'border-radius') {
    return `dimension/radius/${rest.join('/')}`;
  }
  return `primitive/${leaf.path.join('/')}`;
}

function codeSyntaxForCssVariable(cssVariable) {
  return {
    WEB: `var(--${cssVariable})`,
    ANDROID: cssVariable,
    iOS: cssVariable,
  };
}

function createPrimitiveVariables(primitiveLeaves) {
  return primitiveLeaves
    .filter((leaf) => leaf.type === 'color' || leaf.type === 'dimension')
    .map((leaf) => ({
      name: primitiveVariableName(leaf),
      type: leaf.type === 'color' ? 'COLOR' : 'FLOAT',
      scopes: [],
      codeSyntax: {},
      values: {
        Value: leaf.type === 'color' ? colorToFigma(leaf.value) : Number(leaf.value),
      },
    }));
}

function createGeneratedColorVariable(value) {
  const namePart = normalizeColor(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    name: `color/generated/${namePart}`,
    type: 'COLOR',
    scopes: [],
    codeSyntax: {},
    values: { Value: colorToFigma(value) },
  };
}

function createSemanticVariables(model, primitiveVariables) {
  const primitiveColorByValue = new Map();
  for (const variable of primitiveVariables) {
    if (variable.type !== 'COLOR') continue;
    primitiveColorByValue.set(normalizeColor(model.figmaColorToString(variable.values.Value)), variable.name);
  }

  const generatedVariables = new Map();
  const semanticVariables = Object.entries(model.componentTokens.roles).map(([role, sourceKey]) => {
    const values = {};
    for (const [modeName, modeValues] of Object.entries(model.modeValues)) {
      const sourceValue = modeValues[sourceKey];
      const normalizedValue = normalizeColor(sourceValue);
      let primitiveName = primitiveColorByValue.get(normalizedValue);

      if (!primitiveName) {
        const generated = createGeneratedColorVariable(sourceValue);
        generatedVariables.set(generated.name, generated);
        primitiveName = generated.name;
      }

      values[modeName] = { alias: primitiveName };
    }

    return {
      name: `color/${role}`,
      type: 'COLOR',
      scopes: variableScopesForRole(role),
      codeSyntax: codeSyntaxForCssVariable(role),
      description: `Generated from semantic role ${role}.`,
      values,
    };
  });

  return {
    generatedPrimitiveVariables: [...generatedVariables.values()],
    semanticVariables,
  };
}

function createFoundationVariables(model, primitiveVariables) {
  const primitiveByName = new Map(primitiveVariables.map((variable) => [variable.name, variable]));
  const variables = [];

  for (const leaf of model.primitiveLeaves) {
    if (leaf.path[0] !== 'spacing' && leaf.path[0] !== 'border-radius') continue;
    const primitiveName = primitiveVariableName(leaf);
    if (!primitiveByName.has(primitiveName)) {
      throw new Error(`Foundation alias target was not generated: ${primitiveName}`);
    }

    const tokenName = leaf.path.at(-1).replace(/^(space|radius)-/, '');
    const category = leaf.path[0] === 'spacing' ? 'spacing' : 'radius';
    variables.push({
      name: `${category}/${tokenName}`,
      type: 'FLOAT',
      scopes: [category === 'spacing' ? 'GAP' : 'CORNER_RADIUS'],
      codeSyntax: codeSyntaxForCssVariable(`${category}-${tokenName}`),
      values: { Value: { alias: primitiveName } },
    });
  }

  const radiusSource = model.componentTokens.foundations.radius;
  const radiusPrimitiveName = `dimension/radius/${radiusSource}`;
  if (!primitiveByName.has(radiusPrimitiveName)) {
    throw new Error(`Base radius alias target was not generated: ${radiusPrimitiveName}`);
  }
  variables.push({
    name: 'radius/base',
    type: 'FLOAT',
    scopes: ['CORNER_RADIUS'],
    codeSyntax: codeSyntaxForCssVariable('radius'),
    values: { Value: { alias: radiusPrimitiveName } },
  });

  return variables;
}

function figmaColorToString(color) {
  const red = Math.round(color.r * 255);
  const green = Math.round(color.g * 255);
  const blue = Math.round(color.b * 255);
  if (color.a !== 1) return `rgba(${red},${green},${blue},${color.a})`;
  return `#${[red, green, blue].map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

function loadTokenModel() {
  const componentTokens = readJsonFile(COMPONENT_TOKENS_PATH);
  const modes = readJsonFile(MODES_PATH);
  const primitives = readJsonFile(PRIMITIVES_PATH);
  const modeValues = Object.fromEntries(
    Object.entries(modes)
      .filter(([modeName]) => !modeName.startsWith('$'))
      .map(([modeName, value]) => [modeName, flattenModeValues(value, {})]),
  );
  const primitiveLeaves = flattenPrimitiveLeaves(primitives, [], []);

  return {
    componentTokens,
    modeValues,
    primitiveLeaves,
    figmaColorToString,
  };
}

function validateTokenModel(model) {
  const errors = [];
  const requiredRoles = model.componentTokens.requiredColorRoles;
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    errors.push('component-tokens.json must define requiredColorRoles.');
  }

  for (const role of requiredRoles || []) {
    if (!model.componentTokens.roles[role]) {
      errors.push(`Required semantic role is missing: ${role}`);
    }
  }

  for (const [role, sourceKey] of Object.entries(model.componentTokens.roles || {})) {
    for (const [modeName, modeValues] of Object.entries(model.modeValues)) {
      if (modeValues[sourceKey] === undefined || modeValues[sourceKey] === '') {
        errors.push(`Role ${role} cannot resolve source ${sourceKey} in mode ${modeName}.`);
      }
    }
  }

  const radiusSource = model.componentTokens.foundations?.radius;
  const radiusExists = model.primitiveLeaves.some(
    (leaf) => leaf.path[0] === 'border-radius' && leaf.path.at(-1) === radiusSource,
  );
  if (!radiusSource || !radiusExists) {
    errors.push(`Foundation radius must reference an existing primitive radius: ${radiusSource}`);
  }

  const brands = new Map();
  for (const modeName of Object.keys(model.modeValues)) {
    const separatorIndex = modeName.lastIndexOf('-');
    const brand = modeName.slice(0, separatorIndex);
    const scheme = modeName.slice(separatorIndex + 1);
    if (!brands.has(brand)) brands.set(brand, new Set());
    brands.get(brand).add(scheme);
  }
  for (const [brand, schemes] of brands) {
    for (const requiredScheme of ['light', 'dark']) {
      if (!schemes.has(requiredScheme)) {
        errors.push(`Brand ${brand} is missing required ${requiredScheme} mode.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Token validation failed:\n- ${errors.join('\n- ')}`);
  }
}

function createFigmaSnapshot(model) {
  validateTokenModel(model);
  const primitiveVariables = createPrimitiveVariables(model.primitiveLeaves);
  const semanticResult = createSemanticVariables(model, primitiveVariables);
  const allPrimitiveVariables = [
    ...primitiveVariables,
    ...semanticResult.generatedPrimitiveVariables,
  ];

  return {
    schemaVersion: 1,
    source: 'packages/tokens/tokens',
    collections: [
      {
        name: 'LEO Primitives',
        modes: ['Value'],
        variables: allPrimitiveVariables,
      },
      {
        name: 'LEO Semantic Colors',
        modes: Object.keys(model.modeValues),
        variables: semanticResult.semanticVariables,
      },
      {
        name: 'LEO Foundations',
        modes: ['Value'],
        variables: createFoundationVariables(model, allPrimitiveVariables),
      },
    ],
  };
}

module.exports = {
  createFigmaSnapshot,
  loadTokenModel,
  validateTokenModel,
};
