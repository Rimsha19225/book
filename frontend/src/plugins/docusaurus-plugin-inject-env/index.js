// @ts-check

/**
 * Docusaurus plugin to inject environment variables into HTML
 */
module.exports = function pluginInjectEnvironment(context, options) {
  return {
    name: 'docusaurus-plugin-inject-env',

    injectHtmlTags() {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://rimsha19225-physicalchatbot.hf.space/api';

      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `window.API_BASE_URL = "${apiBaseUrl}";`,
          },
        ],
      };
    },
  };
};