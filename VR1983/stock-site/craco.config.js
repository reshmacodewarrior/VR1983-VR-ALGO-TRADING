module.exports = {
  style: {
    postcss: {
      plugins: [
        // Remove postcss-flexbugs-fixes from the plugins list
        require('postcss-preset-env')({
          autoprefixer: {
            flexbox: 'no-2009',
          },
          stage: 3,
        }),
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Override the PostCSS configuration to exclude postcss-flexbugs-fixes
      webpackConfig.module.rules.forEach(rule => {
        if (rule.oneOf) {
          rule.oneOf.forEach(oneOfRule => {
            if (oneOfRule.test && oneOfRule.test.toString().includes('css')) {
              if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
                oneOfRule.use.forEach(use => {
                  if (use.loader && use.loader.includes('postcss-loader')) {
                    if (use.options && use.options.postcssOptions) {
                      // Filter out postcss-flexbugs-fixes from plugins
                      use.options.postcssOptions.plugins = use.options.postcssOptions.plugins.filter(
                        plugin => !(typeof plugin === 'string' && plugin.includes('flexbugs-fixes'))
                      );
                    }
                  }
                });
              }
            }
          });
        }
      });

      return webpackConfig;
    },
  },
}