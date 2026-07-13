const { loadTokenModel, validateTokenModel } = require('./token-model.cjs');

try {
  const model = loadTokenModel();
  validateTokenModel(model);
  console.log(
    `Token contract valid: ${model.componentTokens.requiredColorRoles.length} required color roles, ${Object.keys(model.modeValues).length} modes.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
