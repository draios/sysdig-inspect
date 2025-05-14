const { addLessLoader } = require('customize-cra');

// Custom function to fix PostCSS loader issues
const fixPostcssLoaderConfig = (config) => {
  const oneOfRules = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;

  // Find all rules that use postcss-loader
  oneOfRules.forEach(rule => {
    if (rule.use && Array.isArray(rule.use)) {
      rule.use.forEach(loader => {
        if (loader.loader && loader.loader.includes('postcss-loader') && loader.options) {
          // Fix the options to match the new API
          const options = { ...loader.options };
          delete options.ident;
          delete options.plugins;

          // Set the new options
          loader.options = {
            postcssOptions: {
              plugins: [
                require.resolve('postcss-flexbugs-fixes'),
                [
                  require.resolve('postcss-preset-env'),
                  {
                    autoprefixer: {
                      flexbox: 'no-2009',
                    },
                    stage: 3,
                  },
                ],
                require.resolve('postcss-normalize'),
              ],
            },
            sourceMap: options.sourceMap,
          };
        }
      });
    }
  });

  return config;
};

module.exports = function override(config, env) {
  // Add LESS loader
  config = addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: {
        // You can add any LESS variables here if needed
      }
    }
  })(config, env);

  // Fix PostCSS loader config
  config = fixPostcssLoaderConfig(config);

  return config;
};
