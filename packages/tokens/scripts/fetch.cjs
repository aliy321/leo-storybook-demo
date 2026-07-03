const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ========== 🔧 LOAD CONFIGURATION ==========
const schemaPath = path.join(__dirname, 'schema-fetch.json');
const CONFIG = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Environment variables
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const OUTPUT_DIR = process.env.OUTPUT_DIR || './tokens';

// ========== 🧠 UTILITIES ==========

/**
 * Convert RGB (0-1 range) to hex color
 */
const rgbToHex = (r, g, b) => {
  const toHex = val => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert RGBA (0-1 range) to rgba color string
 * Alpha is rounded to 2 decimal places
 */
const rgbaToString = (r, g, b, a) => {
  const red = Math.round(r * 255);
  const green = Math.round(g * 255);
  const blue = Math.round(b * 255);
  const alpha = Math.round(a * 100) / 100; // Round to 2 decimal places
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

/**
 * Convert string to kebab-case
 */
const toKebabCase = str =>
  str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

/**
 * Parse Figma variable name (remove first part, typically the category prefix)
 * If no slash exists, return the name as-is in an array
 */
const parseVariableName = name => {
  const parts = name.split('/');
  return parts.length > 1 ? parts.slice(1) : parts;
};

/**
 * Build token object following DTCG format
 */
const buildTokenObject = (value, type) => ({ $value: value, $type: type });

/**
 * Set nested value in object by path
 */
const setNestedValue = (obj, path, value) => {
  const keys = path.split('/');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = toKebabCase(keys[i]);
    if (!current[key]) current[key] = {};
    current = current[key];
  }

  const finalKey = toKebabCase(keys[keys.length - 1]);
  current[finalKey] = value;
};

/**
 * Convert category path to alias reference format
 * Example: "typography/font-weights" → "typography.font-weights"
 */
const categoryToAliasPath = category => category.replace(/\//g, '.');

/**
 * Get default value for a type from schema configuration
 */
const getDefaultValue = (resolvedType) => {
  const fallbacks = CONFIG.defaults?.fallbackValues || {};
  return fallbacks[resolvedType] ?? null;
};

/**
 * Get configuration value with fallback to defaults
 */
const getConfigValue = (path, defaultValue = undefined) => {
  const keys = path.split('.');
  let value = CONFIG;
  
  for (const key of keys) {
    if (value?.[key] === undefined) {
      return defaultValue;
    }
    value = value[key];
  }
  
  return value ?? defaultValue;
};

/**
 * Apply name transformation based on schema config
 */
const transformTokenName = (parts, transformRule) => {
  if (!transformRule) return toKebabCase(parts.join('-'));

  // Handle removePrefix: pattern (e.g., "removePrefix:font-")
  if (transformRule.startsWith('removePrefix:')) {
    const prefix = transformRule.split(':')[1];
    const lastPart = parts[parts.length - 1];
    const cleaned = lastPart.replace(new RegExp(`^${prefix}`, 'i'), '');
    return toKebabCase(cleaned || lastPart);
  }

  // Get transformation config from schema (if available)
  const transformConfig = CONFIG.transformations?.[transformRule];
  const transformType = transformConfig?.type || transformRule;

  switch (transformType) {
    case 'lastPart':
    case 'cleanColorToken':
      return toKebabCase(parts[parts.length - 1]);
    
    case 'join':
    case 'joinAll':
      return toKebabCase(parts.join('-'));
    
    case 'auto':
      // Multi-level paths use last part, single-level use all parts
      return parts.length >= 2 
        ? toKebabCase(parts[parts.length - 1]) 
        : toKebabCase(parts.join('-'));
    
    default:
      return toKebabCase(parts.join('-'));
  }
};

// ========== 🌐 FETCH FROM FIGMA ==========

/**
 * Fetch design tokens (variables) from Figma
 */
async function fetchFigmaVariables(fileKey, token) {
  const url = `https://api.figma.com/v1/files/${fileKey}/variables/local`;
  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token },
  });

  if (!res.ok) {
    throw new Error(`❌ Figma API request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return {
    variableCollections: data.meta.variableCollections,
    variables: data.meta.variables,
  };
}

// ========== 🧹 FILTER & CLEAN ==========

/**
 * Filter out deleted or invalid variables and their collections
 */
function filterValidCollections(variableCollections, variables) {
  const validCollections = {};
  const validVariables = {};

  for (const [collectionId, collection] of Object.entries(variableCollections)) {
    const validIds = (collection.variableIds || []).filter(id => variables[id]);

    if (validIds.length > 0) {
      validCollections[collectionId] = { ...collection, variableIds: validIds };
      for (const id of validIds) {
        validVariables[id] = variables[id];
      }
    }
  }

  return { variableCollections: validCollections, variables: validVariables };
}

/**
 * Get collection-specific configuration
 */
function getCollectionConfig(collectionName) {
  const collectionEntry = CONFIG.collections.include.find(
    c => typeof c === 'string' ? c === collectionName : c.name === collectionName
  );
  
  if (!collectionEntry) {
    return {
      multiMode: { enabled: false },
      excludeTokenCategories: CONFIG.collections.excludeTokenCategories || []
    };
  }
  
  // Handle both string format and object format
  if (typeof collectionEntry === 'string') {
    return {
      multiMode: { enabled: false },
      excludeTokenCategories: CONFIG.collections.excludeTokenCategories || []
    };
  }
  
  return {
    multiMode: collectionEntry.multiMode || { enabled: false },
    excludeTokenCategories: collectionEntry.excludeTokenCategories || CONFIG.collections.excludeTokenCategories || [],
    excludeTokenPatterns: collectionEntry.excludeTokenPatterns || [],
    resolveReferences: collectionEntry.resolveReferences || { enabled: false },
    flatStructure: collectionEntry.flatStructure || false,
    excludeHiddenFromPublishing: collectionEntry.excludeHiddenFromPublishing !== undefined 
      ? collectionEntry.excludeHiddenFromPublishing 
      : CONFIG.collections.excludeHiddenFromPublishing !== undefined 
      ? CONFIG.collections.excludeHiddenFromPublishing 
      : true
  };
}

/**
 * Check if collection should be processed based on config
 */
function shouldProcessCollection(collectionName) {
  // Check if collection is in the include list
  const isIncluded = CONFIG.collections.include.some(
    c => typeof c === 'string' ? c === collectionName : c.name === collectionName
  );
  
  if (!isIncluded) {
    return false;
  }
  
  // Check if collection is excluded
  const { exclude } = CONFIG.collections;
  
  if (exclude && exclude.length > 0 && exclude.includes(collectionName)) {
    return false;
  }

  return true;
}

// ========== 🧩 PROCESS TOKENS ==========

/**
 * Find matching pattern configuration for a token
 */
function findPatternConfig(resolvedType, fullName, pathParts, collectionName = null) {
  const typeConfig = CONFIG.tokenMappings[resolvedType];
  if (!typeConfig) return null;

  const firstPart = pathParts[0]?.toLowerCase() || '';
  const fullNameLower = fullName.toLowerCase();

  // Check for multi-level nested paths FIRST (e.g., shadows/blur/shadow-blur-0)
  // This needs to be before explicit pattern matching to preserve nested structure
  const fullParts = fullName.split('/');
  
  if (fullParts.length > 2) {
    // Multi-level nested path (e.g., shadows/blur/shadow-blur-0 or colours/reds/red-50)
    // Category becomes "shadows/blur" or "colours/reds" and token name becomes "shadow-blur-0" or "red-50"
    const categoryPath = fullParts.slice(0, -1).map(p => toKebabCase(p)).join('/');
    return {
      category: categoryPath,
      nameTransform: 'lastPart', // Use only the last part of the path
    };
  }

  // Try to match explicit patterns from config
  if (typeConfig.patterns) {
    for (const pattern of typeConfig.patterns) {
      // Check if pattern matches the full name or first path part
      if (fullNameLower.includes(pattern.match.toLowerCase()) || firstPart.includes(pattern.match)) {
        return pattern;
      }
    }
  }

  // If no pattern matched, auto-detect from path structure
  if (fullParts.length > 1) {
    // Two-level path: use first part as category
    const category = toKebabCase(fullParts[0]);
    
    // Check if we should preserve plurals (default: true)
    const preservePlurals = getConfigValue('defaults.preservePlurals', true);
    const normalizedCategory = (!preservePlurals && category.endsWith('s')) 
      ? category.slice(0, -1) 
      : category;

    return {
      category: normalizedCategory,
      nameTransform: 'auto',
    };
  }

  // Single-level fallback: check if collection uses flat structure (no category)
  if (collectionName) {
    const collectionConfig = getCollectionConfig(collectionName);
    if (collectionConfig?.flatStructure) {
      return {
        category: '',
        nameTransform: 'lastPart',
      };
    }
  }

  // Default fallback: use default category from config
  return {
    category: typeConfig.defaultCategory || 'other',
    nameTransform: typeConfig.defaultNameTransform || 'joinAll',
  };
}

/**
 * Process value based on Figma type (handle aliases and raw values)
 */
function processValue(modeValue, variables, resolvedType, variableName = '') {
  // Handle variable aliases
  if (modeValue?.type === 'VARIABLE_ALIAS') {
    const target = variables[modeValue.id];
    
    // Return fallback if target not found
    if (!target) {
      return getDefaultValue(resolvedType);
    }

    // Get target variable information
    const targetFullName = target.name;
    const targetParts = parseVariableName(targetFullName);
    const targetResolvedType = target.resolvedType;
    
    // Find pattern config for target variable
    const targetPatternConfig = findPatternConfig(targetResolvedType, targetFullName, targetParts);
    
    if (!targetPatternConfig) {
      console.warn(`⚠️ No pattern config found for alias target: ${targetFullName}`);
      return `{unknown}`;
    }
    
    // Transform token name and build reference path
    const aliasKey = transformTokenName(targetParts, targetPatternConfig.nameTransform);
    const aliasPath = categoryToAliasPath(targetPatternConfig.category);
    
    return aliasPath ? `{${aliasPath}.${aliasKey}}` : `{${aliasKey}}`;
  }

  // Handle RGB/RGBA color conversion
  if (resolvedType === 'COLOR' && modeValue?.r !== undefined) {
    // Check if color has alpha channel with transparency (alpha < 1)
    const hasTransparency = modeValue.a !== undefined && modeValue.a < 1;
    
    if (hasTransparency) {
      // Use rgba format for any color with transparency
      return rgbaToString(modeValue.r, modeValue.g, modeValue.b, modeValue.a);
    }
    
    // Use hex format for fully opaque colors
    return rgbToHex(modeValue.r, modeValue.g, modeValue.b);
  }

  // Return raw value for other types
  return modeValue;
}

/**
 * Process a single variable into a token
 */
function processVariable(variable, variables, defaultModeId, collectionName = null) {
  // Check exclusion flags using schema defaults
  const excludeDeleted = getConfigValue('defaults.excludeDeletedButReferenced', true);
  if (excludeDeleted && variable.deletedButReferenced) {
    return null;
  }
  
  // Get excludeHidden config with collection-specific override
  const collectionConfig = collectionName ? getCollectionConfig(collectionName) : null;
  const excludeHidden = collectionConfig?.excludeHiddenFromPublishing ?? 
    getConfigValue('defaults.excludeHiddenFromPublishing', true);
  
  if (excludeHidden && variable.hiddenFromPublishing) {
    return null;
  }

  // Parse variable and get mode value
  const pathParts = parseVariableName(variable.name);
  const modeValue = variable.valuesByMode[defaultModeId];

  if (modeValue === undefined || modeValue === null) {
    return null;
  }

  // Find pattern configuration
  const resolvedType = variable.resolvedType;
  const patternConfig = findPatternConfig(resolvedType, variable.name, pathParts, collectionName);

  if (!patternConfig) {
    console.warn(`⚠️ No pattern config found for: ${variable.name}`);
    return null;
  }

  // Get type mapping
  const typeConfig = CONFIG.tokenMappings[resolvedType];
  if (!typeConfig) {
    console.warn(`⚠️ No type mapping found for: ${resolvedType}`);
    return null;
  }

  // Process value and build token (pass variable name for shadow color detection)
  const value = processValue(modeValue, variables, resolvedType, variable.name);
  const tokenKey = transformTokenName(pathParts, patternConfig.nameTransform);

  return {
    category: patternConfig.category,
    tokenKey,
    value: buildTokenObject(value, typeConfig.dtcgType),
  };
}

/**
 * Process all variables in a collection for a specific mode
 */
function processCollection(collection, variables, modeId) {
  const tokens = {};

  for (const varId of collection.variableIds) {
    const variable = variables[varId];
    if (!variable) continue;

    const result = processVariable(variable, variables, modeId, collection.name);
    if (result) {
      const { category, tokenKey, value } = result;
      // If category is empty, set token at root level
      const path = category ? `${category}/${tokenKey}` : tokenKey;
      setNestedValue(tokens, path, value);
    }
  }

  return tokens;
}

/**
 * Extract category order from Figma's variableIds ordering
 * This preserves the designer's intended order of color families, typography groups, etc.
 */
function extractCategoryOrderFromFigma(collection, variables) {
  const categoryOrder = [];
  const seenCategories = new Set();
  
  for (const varId of collection.variableIds) {
    const variable = variables[varId];
    if (!variable) continue;
    
    const pathParts = parseVariableName(variable.name);
    const resolvedType = variable.resolvedType;
    
    // Find the category this variable belongs to
    const patternConfig = findPatternConfig(resolvedType, variable.name, pathParts, collection.name);
    if (patternConfig && patternConfig.category) {
      const category = patternConfig.category;
      
      // Extract top-level category (e.g., "colours" from "colours/reds")
      const topCategory = category.split('/')[0];
      
      if (!seenCategories.has(topCategory)) {
        seenCategories.add(topCategory);
        categoryOrder.push(topCategory);
      }
      
      // Also track nested categories (e.g., "colours/reds")
      if (!seenCategories.has(category)) {
        seenCategories.add(category);
        categoryOrder.push(category);
      }
    }
  }
  
  return categoryOrder;
}

/**
 * Extract subcategory order within a category from Figma's ordering
 * For example, within "colours", extract the order: reds, dark-reds, blues, etc.
 */
function extractSubcategoryOrderFromFigma(collection, variables, parentCategory) {
  const subcategoryOrder = [];
  const seenSubcategories = new Set();
  
  for (const varId of collection.variableIds) {
    const variable = variables[varId];
    if (!variable) continue;
    
    const pathParts = parseVariableName(variable.name);
    const resolvedType = variable.resolvedType;
    
    const patternConfig = findPatternConfig(resolvedType, variable.name, pathParts, collection.name);
    if (patternConfig && patternConfig.category) {
      const category = patternConfig.category;
      
      // Check if this belongs to the parent category
      if (category === parentCategory || category.startsWith(parentCategory + '/')) {
        // Extract subcategory name
        const parts = category.split('/');
        if (parts[0] === parentCategory && parts.length > 1) {
          const subcategory = parts[1];
          if (!seenSubcategories.has(subcategory)) {
            seenSubcategories.add(subcategory);
            subcategoryOrder.push(subcategory);
          }
        }
      }
    }
  }
  
  return subcategoryOrder;
}

/**
 * Extract token order within a specific category from Figma's ordering
 * For example, within "typography/font-sizes", extract the order: display-lg, display, heading-2xl, etc.
 */
function extractTokenOrderFromFigma(collection, variables, targetCategory) {
  const tokenOrder = [];
  const seenTokens = new Set();
  
  for (const varId of collection.variableIds) {
    const variable = variables[varId];
    if (!variable) continue;
    
    const pathParts = parseVariableName(variable.name);
    const resolvedType = variable.resolvedType;
    
    const patternConfig = findPatternConfig(resolvedType, variable.name, pathParts, collection.name);
    if (patternConfig && patternConfig.category === targetCategory) {
      const tokenKey = transformTokenName(pathParts, patternConfig.nameTransform);
      
      if (!seenTokens.has(tokenKey)) {
        seenTokens.add(tokenKey);
        tokenOrder.push(tokenKey);
      }
    }
  }
  
  return tokenOrder;
}

/**
 * Normalize mode name for output
 * Converts mode names to kebab-case
 */
function normalizeModeNameForOutput(modeName) {
  return toKebabCase(modeName);
}

/**
 * Detect if mode name represents dark mode using schema configuration
 */
function isDarkMode(modeName, multiModeConfig) {
  const darkSuffix = multiModeConfig?.darkModeSuffix || 
    getConfigValue('defaults.multiMode.darkModeSuffix', '-dark');
  return modeName.toLowerCase().endsWith(darkSuffix.toLowerCase());
}

/**
 * Extract base theme name from mode name
 * Example: "default-dark" -> "default", "agency-dark" -> "agency"
 */
function getBaseThemeName(modeName, multiModeConfig) {
  const darkSuffix = multiModeConfig?.darkModeSuffix || 
    getConfigValue('defaults.multiMode.darkModeSuffix', '-dark');
  const normalized = normalizeModeNameForOutput(modeName);
  
  if (isDarkMode(normalized, multiModeConfig)) {
    return normalized.slice(0, -darkSuffix.length);
  }
  
  return normalized;
}

/**
 * Process collection with multi-mode support
 * Returns object with mode structure or single tokens object
 */
function processCollectionWithModes(collection, variables) {
  // Get collection-specific configuration
  const collectionConfig = getCollectionConfig(collection.name);
  const multiModeConfig = collectionConfig?.multiMode || 
    getConfigValue('defaults.multiMode', { enabled: false });
  
  const multiModeEnabled = multiModeConfig.enabled && collection.modes.length > 1;
  const outputStrategy = multiModeConfig.outputStrategy || 
    getConfigValue('defaults.multiMode.outputStrategy', 'single-file');
  
  if (multiModeEnabled && outputStrategy === 'single-file') {
    // Single file with nested structure: { "theme-name": { tokens }, "theme-name-dark": { tokens } }
    const allModes = {};
    
    for (const mode of collection.modes) {
      const modeName = normalizeModeNameForOutput(mode.name);
      const tokens = processCollection(collection, variables, mode.modeId);
      
      // Store with normalized mode name (supports both light and dark modes)
      allModes[modeName] = tokens;
    }
    
    return { type: 'single-file', modes: allModes };
  } else if (multiModeEnabled) {
    // Separate files for the v3 token build pipeline.
    const results = [];
    for (const mode of collection.modes) {
      const tokens = processCollection(collection, variables, mode.modeId);
      results.push({
        modeName: mode.name,
        modeId: mode.modeId,
        tokens,
      });
    }
    return { type: 'separate-files', results };
  } else {
    // Single mode: use default mode
    const tokens = processCollection(collection, variables, collection.defaultModeId);
    return { type: 'single-mode', tokens };
  }
}

// ========== ⚙️ SORTING ==========

/**
 * Sort keys according to category-specific pattern from schema
 */
function sortCategoryKeys(keys, categoryName) {
  const sortConfig = CONFIG.sorting?.categories?.[categoryName];
  if (!sortConfig?.pattern) {
    // Default alphabetical with numeric sorting
    return keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  const regex = new RegExp(sortConfig.pattern);

  return keys.sort((a, b) => {
    const matchA = a.match(regex);
    const matchB = b.match(regex);

    // Both match pattern
    if (matchA && matchB) {
      const [, darkA, colorA, numA] = matchA;
      const [, darkB, colorB, numB] = matchB;

      // Sort by color family
      if (colorA !== colorB) return colorA.localeCompare(colorB);

      // Sort by variant (non-dark first)
      if (!!darkA !== !!darkB) return darkA ? 1 : -1;

      // Sort by numeric scale
      return Number(numA) - Number(numB);
    }

    // Matching keys come first
    if (matchA) return -1;
    if (matchB) return 1;

    // Default alphabetical
    return a.localeCompare(b);
  });
}

/**
 * Sort tokens by category order from schema or Figma
 */
function sortTokens(tokens, figmaCategoryOrder = null, collection = null, variables = null) {
  const categoryOrder = figmaCategoryOrder || CONFIG.categoryOrder;
  const sortedTokens = {};

  const sortedCategories = Object.keys(tokens).sort((a, b) => {
    const ai = categoryOrder.indexOf(a);
    const bi = categoryOrder.indexOf(b);

    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;

    return ai - bi;
  });

  for (const category of sortedCategories) {
    sortedTokens[category] = sortObjectKeysRecursive(tokens[category], category, collection, variables);
  }

  return sortedTokens;
}

/**
 * Recursively sort object keys with Figma order support at all levels
 */
function sortObjectKeysRecursive(obj, currentPath, collection, variables) {
  if (Array.isArray(obj)) return obj.map(item => sortObjectKeysRecursive(item, currentPath, collection, variables));
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Check if this is a token (has $value property)
  if (obj.$value !== undefined) return obj;

  const keys = Object.keys(obj);
  let sortedKeys;
  
  // Try to extract Figma order for this level
  let figmaOrder = null;
  if (collection && variables) {
    // Check if this is a subcategory level (e.g., "colours" with "reds", "blues" as keys)
    const firstKey = keys[0];
    const firstValue = obj[firstKey];
    
    // If the first value is an object with nested structure, extract subcategory order
    if (firstValue && typeof firstValue === 'object' && !firstValue.$value) {
      figmaOrder = extractSubcategoryOrderFromFigma(collection, variables, currentPath);
    } else {
      // Otherwise, extract token order for this specific category
      figmaOrder = extractTokenOrderFromFigma(collection, variables, currentPath);
    }
  }
  
  if (figmaOrder && figmaOrder.length > 0) {
    // Use Figma's ordering
    sortedKeys = keys.sort((a, b) => {
      const aIndex = figmaOrder.indexOf(a);
      const bIndex = figmaOrder.indexOf(b);
      
      // Both in Figma order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      // Only a in Figma order
      if (aIndex !== -1) return -1;
      // Only b in Figma order
      if (bIndex !== -1) return 1;
      // Neither in Figma order, fall back to alphabetical
      return a.localeCompare(b, undefined, { numeric: true });
    });
  } else if (CONFIG.sorting?.enabled) {
    // Use schema-based pattern sorting
    sortedKeys = sortCategoryKeys(keys, currentPath);
  } else {
    // Default alphabetical
    sortedKeys = keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  const sortedObj = {};
  for (const key of sortedKeys) {
    const newPath = currentPath ? `${currentPath}/${key}` : key;
    sortedObj[key] = sortObjectKeysRecursive(obj[key], newPath, collection, variables);
  }

  return sortedObj;
}

// ========== � REFERENCE RESOLUTION ==========

/**
 * Load tokens from source collection files
 */
function loadSourceTokens(sourceCollections) {
  const sourceTokens = {};
  
  for (const collectionName of sourceCollections) {
    const fileName = `${toKebabCase(collectionName)}.tokens.json`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      sourceTokens[collectionName] = JSON.parse(content);
      console.log(`    ✓ Loaded: ${fileName}`);
    } else {
      console.warn(`    ✗ NOT FOUND: ${fileName} - references may not resolve`);
    }
  }
  
  return sourceTokens;
}

/**
 * Resolve reference value from source tokens
 * Example: "{background.dark-red-50}" -> "#fbf2f2"
 * Example: "{shadow-blur-0}" -> "0"
 * Example: "{colours.alphas.blacks.black-30}" -> "#0a0a0a"
 * Handles any number of dot-separated path levels
 */
function resolveReference(value, sourceTokens) {
  if (typeof value !== 'string') return value;
  
  const refConfig = CONFIG.referenceResolution;
  if (!refConfig?.pattern) return value;
  
  const regex = new RegExp(refConfig.pattern);
  const match = value.match(regex);
  
  if (!match) return value;
  
  // Extract the full path (all parts between braces)
  const fullPath = match[1];
  const pathParts = fullPath.split('.');
  const categoryMapping = refConfig.categoryMapping || {};
  
  // Handle single-part references like {shadow-blur-0}
  // These need to be searched across all categories
  if (pathParts.length === 1) {
    const prefix = pathParts[0];
    
    // First try to find via category mapping
    const mappedCategory = categoryMapping[prefix];
    if (mappedCategory) {
      for (const tokens of Object.values(sourceTokens)) {
        if (tokens[mappedCategory]) {
          // Search in nested subcategories
          for (const [subkey, subcategoryTokens] of Object.entries(tokens[mappedCategory])) {
            if (typeof subcategoryTokens === 'object' && subcategoryTokens !== null) {
              // Check if the token exists in this subcategory
              const fullTokenName = `${subkey}-${prefix}`;
              if (subcategoryTokens[fullTokenName]?.$value !== undefined) {
                return subcategoryTokens[fullTokenName].$value;
              }
            }
          }
          // Also check flat structure directly under category
          if (tokens[mappedCategory][prefix]?.$value !== undefined) {
            return tokens[mappedCategory][prefix].$value;
          }
        }
      }
    }
    
    // Fallback: search everywhere for the token name
    for (const tokens of Object.values(sourceTokens)) {
      for (const [category, categoryTokens] of Object.entries(tokens)) {
        if (typeof categoryTokens === 'object' && categoryTokens !== null) {
          // Search in nested subcategories
          for (const [subkey, token] of Object.entries(categoryTokens)) {
            if (typeof token === 'object' && token !== null) {
              if (token[prefix]?.$value !== undefined) {
                return token[prefix].$value;
              }
            }
          }
          // Search in flat structure
          if (categoryTokens[prefix]?.$value !== undefined) {
            return categoryTokens[prefix].$value;
          }
        }
      }
    }
    return value;
  }
  
  // Handle multi-part references (2 or more parts)
  // First part is the category prefix
  const prefix = pathParts[0];
  const targetCategory = categoryMapping[prefix];
  
  if (!targetCategory) return value;
  
  // Navigate through the token hierarchy using remaining path parts
  for (const tokens of Object.values(sourceTokens)) {
    if (!tokens[targetCategory]) continue;
    
    let current = tokens[targetCategory];
    let foundAtLevel = false;
    
    // Navigate through each remaining part of the path
    for (let i = 1; i < pathParts.length; i++) {
      const part = pathParts[i];
      
      if (current[part]) {
        current = current[part];
        
        // Check if we've reached a token value
        if (current?.$value !== undefined) {
          return current.$value;
        }
        
        foundAtLevel = true;
      } else {
        foundAtLevel = false;
        break;
      }
    }
  }
  
  // Fallback: try the old logic for compatibility with 3-part paths
  // Handle nested path (e.g., typography.font-weights.font-regular)
  if (pathParts.length >= 3) {
    const subcategoryOrToken = pathParts[1];
    const tokenName = pathParts.slice(2).join('-');
    
    for (const tokens of Object.values(sourceTokens)) {
      if (tokens[targetCategory] && tokens[targetCategory][subcategoryOrToken]) {
        // Remove prefixes from token name based on schema configuration
        let cleanTokenName = tokenName;
        const prefixStripping = refConfig.prefixStripping || {};
        
        if (prefixStripping[subcategoryOrToken]) {
          // Apply all prefix patterns for this subcategory in order
          for (const pattern of prefixStripping[subcategoryOrToken]) {
            cleanTokenName = cleanTokenName.replace(new RegExp(`^${pattern}`), '');
          }
        }
        
        const subcategory = tokens[targetCategory][subcategoryOrToken];
        if (subcategory && subcategory[cleanTokenName]) {
          const resolvedValue = subcategory[cleanTokenName].$value;
          return resolvedValue !== undefined ? resolvedValue : value;
        }
      }
      // Handle flat path (e.g., background.dark-red-50)
      else if (!tokenName && tokens[targetCategory] && tokens[targetCategory][subcategoryOrToken]) {
        return tokens[targetCategory][subcategoryOrToken].$value || value;
      }
    }
  }
  
  return value;
}

/**
 * Recursively resolve all references in token object
 */
function resolveReferencesInTokens(tokens, sourceTokens) {
  if (Array.isArray(tokens)) {
    return tokens.map(item => resolveReferencesInTokens(item, sourceTokens));
  }
  
  if (tokens === null || typeof tokens !== 'object') {
    return tokens;
  }
  
  const resolved = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key === '$value') {
      resolved[key] = resolveReference(value, sourceTokens);
    } else if (typeof value === 'object') {
      resolved[key] = resolveReferencesInTokens(value, sourceTokens);
    } else {
      resolved[key] = value;
    }
  }
  
  return resolved;
}

// ========== �📦 EXPORT ==========

/**
 * Filter and sort tokens
 */
function processTokensForOutput(tokens, collectionName, figmaCategoryOrder = null, collection = null, variables = null) {
  const sortedTokens = CONFIG.outputFormat.sortKeys ? sortTokens(tokens, figmaCategoryOrder, collection, variables) : tokens;
  
  // Get collection-specific config for excluded categories
  const collectionConfig = getCollectionConfig(collectionName);
  const excludeTokenCategories = collectionConfig?.excludeTokenCategories 
    || CONFIG.defaults?.excludeTokenCategories 
    || [];
  
  // Get token name exclusion patterns from config
  const excludeTokenPatterns = collectionConfig?.excludeTokenPatterns || [];
  
  const filteredTokens = Object.keys(sortedTokens).reduce((acc, key) => {
    const value = sortedTokens[key];
    
    // Check if this is a token (has $value) or a category
    const isToken = value?.$value !== undefined;
    
    if (isToken) {
      // This is a root-level token, keep it as is
      acc[key] = value;
    } else if (!excludeTokenCategories.includes(key) && typeof value === 'object') {
      // This is a category, filter its tokens
      if (excludeTokenPatterns.length > 0) {
        const filteredCategoryTokens = Object.keys(value).reduce((catAcc, tokenKey) => {
          // Check if token name matches any exclusion pattern
          const shouldExclude = excludeTokenPatterns.some(pattern => tokenKey.startsWith(pattern));
          
          if (!shouldExclude) {
            catAcc[tokenKey] = value[tokenKey];
          }
          return catAcc;
        }, {});
        
        // Only add category if it has tokens after filtering
        if (Object.keys(filteredCategoryTokens).length > 0) {
          acc[key] = filteredCategoryTokens;
        }
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
  
  return filteredTokens;
}

/**
 * Generate and save tokens file for single-file multi-mode structure
 */
function generateSingleFileWithModes(collectionName, modesData, collection, variables) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Get collection config to check if reference resolution is needed
  const collectionConfig = getCollectionConfig(collectionName);
  const resolveReferencesConfig = collectionConfig?.resolveReferences;
  
  // Extract Figma ordering
  const figmaCategoryOrder = collection ? extractCategoryOrderFromFigma(collection, variables) : null;
  
  let output = {};
  
  // Process each mode and add to output
  for (const [modeName, tokens] of Object.entries(modesData)) {
    output[modeName] = processTokensForOutput(tokens, collectionName, figmaCategoryOrder, collection, variables);
  }
  
  // Resolve references if enabled
  if (resolveReferencesConfig?.enabled && resolveReferencesConfig?.sourceCollections) {
    console.log(`  ├─ Resolving references from: ${resolveReferencesConfig.sourceCollections.join(', ')}`);
    const sourceTokens = loadSourceTokens(resolveReferencesConfig.sourceCollections);
    const sourceCount = Object.keys(sourceTokens).reduce((sum, col) => sum + JSON.stringify(sourceTokens[col]).length, 0);
    console.log(`  ├─ Loaded source tokens: ${Object.keys(sourceTokens).length} collections (~${sourceCount} bytes)`);
    output = resolveReferencesInTokens(output, sourceTokens);
  }
  
  const fileName = `${toKebabCase(collectionName)}.tokens.json`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const indent = CONFIG.outputFormat.indent || 2;
  
  fs.writeFileSync(filePath, JSON.stringify(output, null, indent));
  console.log(`✅ Exported: ${filePath} (${Object.keys(modesData).length} themes)`);
}

/**
 * Generate and save a combined token file.
 */
function generateTokensFile(collectionName, tokens, collection, variables) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Extract Figma ordering
  const figmaCategoryOrder = collection ? extractCategoryOrderFromFigma(collection, variables) : null;
  
  let filteredTokens = processTokensForOutput(tokens, collectionName, figmaCategoryOrder, collection, variables);

  // Get collection config to check if reference resolution is needed
  const collectionConfig = getCollectionConfig(collectionName);
  const resolveReferencesConfig = collectionConfig?.resolveReferences;
  
  // Resolve references if enabled
  if (resolveReferencesConfig?.enabled && resolveReferencesConfig?.sourceCollections) {
    const sourceTokens = loadSourceTokens(resolveReferencesConfig.sourceCollections);
    filteredTokens = resolveReferencesInTokens(filteredTokens, sourceTokens);
  }

  const fileName = `${toKebabCase(collectionName)}.tokens.json`;
  const filePath = path.join(OUTPUT_DIR, fileName);
  const indent = CONFIG.outputFormat.indent || 2;

  fs.writeFileSync(filePath, JSON.stringify(filteredTokens, null, indent));
  console.log(`✅ Exported: ${filePath}`);
}

/**
 * Save raw Figma data for debugging
 */
function saveRawData(variableCollections, variables) {
  const debugDir = path.join(OUTPUT_DIR, '../');
  fs.writeFileSync(path.join(debugDir, 'variablesCollection.json'), JSON.stringify(variableCollections, null, 2));
  fs.writeFileSync(path.join(debugDir, 'variables.json'), JSON.stringify(variables, null, 2));
  console.log('📝 Saved raw Figma data for debugging');
}

// ========== 🚀 MAIN ==========

async function main() {
  try {
    // Validate environment
    if (!FIGMA_FILE_KEY || !FIGMA_TOKEN) {
      throw new Error('❌ Missing FIGMA_FILE_KEY or FIGMA_TOKEN in environment variables');
    }

    console.log('📡 Fetching design tokens from Figma...');
    const raw = await fetchFigmaVariables(FIGMA_FILE_KEY, FIGMA_TOKEN);

    // console.log('💾 Saving raw data...');
    // saveRawData(raw.variableCollections, raw.variables);

    console.log('🧹 Filtering valid collections and variables...');
    const clean = filterValidCollections(raw.variableCollections, raw.variables);

    console.log('⚙️  Processing collections...');
    const collectionsToProcess = Object.entries(clean.variableCollections).filter(([, collection]) => shouldProcessCollection(collection.name));

    if (collectionsToProcess.length === 0) {
      console.warn('⚠️  No matching collections found to process.');
      return;
    }

    // Remove duplicate collection names (keep only the one with most modes, then most variables)
    const collectionsByName = {};
    for (const [collectionId, collection] of collectionsToProcess) {
      const name = collection.name;
      const modeCount = (collection.modes || []).length;
      const varCount = (collection.variableIds || []).length;
      
      if (!collectionsByName[name]) {
        collectionsByName[name] = [collectionId, collection];
      } else {
        const existingModeCount = (collectionsByName[name][1].modes || []).length;
        const existingVarCount = (collectionsByName[name][1].variableIds || []).length;
        
        // Prioritize: most modes first, then most variables
        if (modeCount > existingModeCount || (modeCount === existingModeCount && varCount > existingVarCount)) {
          collectionsByName[name] = [collectionId, collection];
        }
      }
    }

    const uniqueCollections = Object.values(collectionsByName);
    
    if (uniqueCollections.length < collectionsToProcess.length) {
      console.log(`  ⚠️  Found duplicate collection name(s), keeping ${uniqueCollections.length} unique`);
    }

    // Sort collections according to schema order (to respect dependencies)
    const schemaOrder = CONFIG.collections.include.map(c => c.name);
    uniqueCollections.sort((a, b) => {
      const indexA = schemaOrder.indexOf(a[1].name);
      const indexB = schemaOrder.indexOf(b[1].name);
      // Collections not in schema go to the end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    for (const [, collection] of uniqueCollections) {
      console.log(`→ Processing: ${collection.name}`);
      
      // Process collection with multi-mode support
      const result = processCollectionWithModes(collection, clean.variables);
      
      // Handle different output types
      if (result.type === 'single-file') {
        // Single file with all modes nested
        const modeNames = Object.keys(result.modes);
        modeNames.forEach(name => console.log(`  ├─ Theme: ${name}`));
        generateSingleFileWithModes(collection.name, result.modes, collection, clean.variables);
      } else if (result.type === 'separate-files') {
        // Separate files for the v3 token build pipeline.
        for (const { modeName, tokens } of result.results) {
          console.log(`  ├─ Mode: ${modeName}`);
          generateTokensFile(collection.name, tokens, collection, clean.variables);
        }
      } else {
        // Single mode collection
        generateTokensFile(collection.name, result.tokens, collection, clean.variables);
      }
    }

    console.log('🎉 All collections processed successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Execute
main();
