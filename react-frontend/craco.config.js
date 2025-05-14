const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the style rules
      const oneOfRules = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;

      // Add LESS support
      const lessRule = {
        test: lessRegex,
        exclude: lessModuleRegex,
        use: [
          // The first two loaders are the same as for CSS
          ...oneOfRules.find(rule => rule.test && rule.test.toString().includes('css') && !rule.test.toString().includes('module')).use,
          {
            loader: require.resolve('less-loader'),
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
        sideEffects: true,
      };

      // Add LESS modules support
      const lessModuleRule = {
        test: lessModuleRegex,
        use: [
          // The first loaders are the same as for CSS modules
          ...oneOfRules.find(rule => rule.test && rule.test.toString().includes('module')).use,
          {
            loader: require.resolve('less-loader'),
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      };

      // Insert the LESS rules before the file-loader rule
      const fileLoaderIndex = oneOfRules.findIndex(rule => rule.type === 'asset/resource');
      oneOfRules.splice(fileLoaderIndex, 0, lessRule, lessModuleRule);

      // Fix PostCSS loader issues
      oneOfRules.forEach(rule => {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(loader => {
            if (loader.loader && loader.loader.includes('postcss-loader') && loader.options) {
              // Fix the options to match the new API
              if (loader.options.ident) {
                delete loader.options.ident;
              }

              if (loader.options.plugins) {
                loader.options.postcssOptions = {
                  plugins: loader.options.plugins
                };
                delete loader.options.plugins;
              }
            }
          });
        }
      });

      return webpackConfig;
    }
  }
};
