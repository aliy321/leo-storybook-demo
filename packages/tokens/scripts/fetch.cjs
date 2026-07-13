const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env.local') });

const FIGMA_API_ROOT = 'https://api.figma.com/v1';
const OUTPUT_PATH = path.join(__dirname, '../review/figma-pull/local.variables.json');
const MAX_ATTEMPTS = 3;

function requireEnvironment(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function requestFigma(url, token, context) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'X-Figma-Token': token },
      });
      const responseBody = await response.text();
      if (!response.ok) {
        throw new Error(
          `Figma request failed: context=${context} status=${response.status} body=${responseBody}`,
        );
      }
      return JSON.parse(responseBody);
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

function writeReviewSnapshot(figmaState) {
  if (!figmaState.meta?.variableCollections || !figmaState.meta?.variables) {
    throw new TypeError('Figma local variables response is missing collections or variables.');
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(figmaState, null, 2)}\n`);
}

async function main() {
  const fileKey = requireEnvironment('FIGMA_FILE_KEY');
  const token = requireEnvironment('FIGMA_TOKEN');
  const url = `${FIGMA_API_ROOT}/files/${fileKey}/variables/local`;
  console.log('Figma token pull target', { fileKey });
  const figmaState = await requestFigma(url, token, `read variables fileKey=${fileKey}`);
  writeReviewSnapshot(figmaState);
  console.log('Figma review snapshot written', {
    fileKey,
    outputPath: OUTPUT_PATH,
    collectionCount: Object.keys(figmaState.meta.variableCollections).length,
    variableCount: Object.keys(figmaState.meta.variables).length,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
