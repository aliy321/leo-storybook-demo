const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env.local') });

const FIGMA_API_ROOT = 'https://api.figma.com/v1';
const SNAPSHOT_PATH = path.join(__dirname, '../dist/figma.variables.json');
const MAX_ATTEMPTS = 3;

function requireEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error(`Figma snapshot not found at ${SNAPSHOT_PATH}. Run token:build first.`);
  }
  return JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
}

async function requestFigma(url, options, context) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, options);
      const responseBody = await response.text();
      if (!response.ok) {
        throw new Error(
          `Figma request failed: context=${context} status=${response.status} body=${responseBody}`,
        );
      }
      return responseBody ? JSON.parse(responseBody) : {};
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        console.warn('Figma request retry', {
          context,
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  throw new Error(
    `Figma request exhausted retries: context=${context} error=${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}

function temporaryId(prefix, name) {
  return `${prefix}:${name.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
}

function localCollectionsByName(figmaState) {
  return new Map(
    Object.values(figmaState.meta.variableCollections)
      .filter((collection) => !collection.remote)
      .map((collection) => [collection.name, collection]),
  );
}

function createCollectionChanges(snapshot, figmaState) {
  const existingCollections = localCollectionsByName(figmaState);
  const collectionRefs = new Map();
  const modeRefs = new Map();
  const variableCollections = [];
  const variableModes = [];

  for (const collection of snapshot.collections) {
    const existing = existingCollections.get(collection.name);
    if (existing) {
      collectionRefs.set(collection.name, existing.id);
      const existingModes = new Map(existing.modes.map((mode) => [mode.name, mode.modeId]));
      for (const modeName of collection.modes) {
        const existingModeId = existingModes.get(modeName);
        if (existingModeId) {
          modeRefs.set(`${collection.name}/${modeName}`, existingModeId);
          continue;
        }
        const modeId = temporaryId('mode', `${collection.name}-${modeName}`);
        modeRefs.set(`${collection.name}/${modeName}`, modeId);
        variableModes.push({
          action: 'CREATE',
          id: modeId,
          name: modeName,
          variableCollectionId: existing.id,
        });
      }
      continue;
    }

    const collectionId = temporaryId('collection', collection.name);
    const initialModeId = temporaryId('mode', `${collection.name}-${collection.modes[0]}`);
    collectionRefs.set(collection.name, collectionId);
    modeRefs.set(`${collection.name}/${collection.modes[0]}`, initialModeId);
    variableCollections.push({
      action: 'CREATE',
      id: collectionId,
      name: collection.name,
      initialModeId,
      hiddenFromPublishing: false,
    });

    for (const modeName of collection.modes.slice(1)) {
      const modeId = temporaryId('mode', `${collection.name}-${modeName}`);
      modeRefs.set(`${collection.name}/${modeName}`, modeId);
      variableModes.push({
        action: 'CREATE',
        id: modeId,
        name: modeName,
        variableCollectionId: collectionId,
      });
    }
  }

  return { collectionRefs, modeRefs, variableCollections, variableModes };
}

function createVariableChanges(snapshot, figmaState, collectionRefs) {
  const existingVariables = new Map();
  for (const variable of Object.values(figmaState.meta.variables)) {
    if (variable.remote) continue;
    existingVariables.set(`${variable.variableCollectionId}/${variable.name}`, variable);
  }

  const variableRefs = new Map();
  const variables = [];

  for (const collection of snapshot.collections) {
    const collectionId = collectionRefs.get(collection.name);
    for (const variable of collection.variables) {
      const existing = existingVariables.get(`${collectionId}/${variable.name}`);
      if (existing) {
        variableRefs.set(`${collection.name}/${variable.name}`, existing.id);
        variables.push({
          action: 'UPDATE',
          id: existing.id,
          name: variable.name,
          description: variable.description || '',
          hiddenFromPublishing: false,
          scopes: variable.scopes,
          codeSyntax: variable.codeSyntax,
        });
        continue;
      }

      const variableId = temporaryId('variable', `${collection.name}-${variable.name}`);
      variableRefs.set(`${collection.name}/${variable.name}`, variableId);
      variables.push({
        action: 'CREATE',
        id: variableId,
        name: variable.name,
        variableCollectionId: collectionId,
        resolvedType: variable.type,
        description: variable.description || '',
        hiddenFromPublishing: false,
        scopes: variable.scopes,
        codeSyntax: variable.codeSyntax,
      });
    }
  }

  return { variableRefs, variables };
}

function findAliasTarget(snapshot, aliasName) {
  for (const collection of snapshot.collections) {
    if (collection.variables.some((variable) => variable.name === aliasName)) {
      return `${collection.name}/${aliasName}`;
    }
  }
  throw new Error(`Figma snapshot alias target does not exist: ${aliasName}`);
}

function createVariableModeValues(snapshot, modeRefs, variableRefs) {
  const values = [];

  for (const collection of snapshot.collections) {
    for (const variable of collection.variables) {
      const variableId = variableRefs.get(`${collection.name}/${variable.name}`);
      for (const [modeName, rawValue] of Object.entries(variable.values)) {
        const modeId = modeRefs.get(`${collection.name}/${modeName}`);
        if (!modeId) {
          throw new Error(`Mode reference does not exist: ${collection.name}/${modeName}`);
        }

        const value =
          rawValue && typeof rawValue === 'object' && rawValue.alias
            ? {
                type: 'VARIABLE_ALIAS',
                id: variableRefs.get(findAliasTarget(snapshot, rawValue.alias)),
              }
            : rawValue;

        if (value && value.type === 'VARIABLE_ALIAS' && !value.id) {
          throw new Error(`Variable alias could not resolve target: ${rawValue.alias}`);
        }

        values.push({ variableId, modeId, value });
      }
    }
  }

  return values;
}

function createPushPayload(snapshot, figmaState) {
  const collections = createCollectionChanges(snapshot, figmaState);
  const variableChanges = createVariableChanges(
    snapshot,
    figmaState,
    collections.collectionRefs,
  );

  return {
    variableCollections: collections.variableCollections,
    variableModes: collections.variableModes,
    variables: variableChanges.variables,
    variableModeValues: createVariableModeValues(
      snapshot,
      collections.modeRefs,
      variableChanges.variableRefs,
    ),
  };
}

function containsUndefined(value) {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  return Object.values(value).some(containsUndefined);
}

function validatePushPayload(payload) {
  const sections = [
    'variableCollections',
    'variableModes',
    'variables',
    'variableModeValues',
  ];
  for (const section of sections) {
    if (!Array.isArray(payload[section])) {
      throw new TypeError(`Figma push payload section must be an array: ${section}`);
    }
  }

  if (containsUndefined(payload)) {
    throw new TypeError('Figma push payload contains an undefined value.');
  }

  for (const modeValue of payload.variableModeValues) {
    if (!modeValue.variableId || !modeValue.modeId || modeValue.value === undefined) {
      throw new TypeError(
        `Invalid Figma mode value: variableId=${modeValue.variableId} modeId=${modeValue.modeId}`,
      );
    }
  }
}

function emptyFigmaState() {
  return {
    meta: {
      variableCollections: {},
      variables: {},
    },
  };
}

function payloadSummary(payload) {
  return {
    collectionChanges: payload.variableCollections.length,
    modeChanges: payload.variableModes.length,
    variableChanges: payload.variables.length,
    valueChanges: payload.variableModeValues.length,
  };
}

async function main(dryRun) {
  const snapshot = readSnapshot();
  if (dryRun) {
    const payload = createPushPayload(snapshot, emptyFigmaState());
    validatePushPayload(payload);
    console.log('Figma push dry-run passed', payloadSummary(payload));
    return;
  }

  const fileKey = requireEnvironment('FIGMA_FILE_KEY');
  const token = requireEnvironment('FIGMA_TOKEN');
  const url = `${FIGMA_API_ROOT}/files/${fileKey}/variables`;
  const headers = {
    'X-Figma-Token': token,
    'Content-Type': 'application/json',
  };

  console.log('Figma token push target', { fileKey });
  const figmaState = await requestFigma(
    `${url}/local`,
    { method: 'GET', headers },
    `read variables fileKey=${fileKey}`,
  );
  const payload = createPushPayload(snapshot, figmaState);
  validatePushPayload(payload);
  const result = await requestFigma(
    url,
    { method: 'POST', headers, body: JSON.stringify(payload) },
    `push variables fileKey=${fileKey}`,
  );

  console.log('Figma variables pushed', {
    fileKey,
    ...payloadSummary(payload),
    createdIds: Object.keys(result.meta?.tempIdToRealId || {}).length,
  });
}

if (require.main === module) {
  main(process.argv.includes('--dry-run')).catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  });
}

module.exports = {
  createPushPayload,
  emptyFigmaState,
  validatePushPayload,
};
