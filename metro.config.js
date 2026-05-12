const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Disable Node-style "exports" field resolution. On web, Metro otherwise
// picks ESM entries that emit `import.meta`, which the dev script tag
// (not type="module") cannot execute — producing
// "Cannot use 'import.meta' outside a module".
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });
