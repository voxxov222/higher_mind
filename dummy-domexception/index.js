// Export the platform's native DOMException to prevent node-domexception deprecation warnings.
module.exports = globalThis.DOMException || Error;
