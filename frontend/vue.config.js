const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/static/bundles/'
      : 'http://localhost:8080/static/bundles/',
  outputDir: 'dist/bundles',
  pages: {
    index: {
      entry: 'src/js/pages/index.js'
    },
    detail: {
      entry: 'src/js/pages/detail.js'
    }
  },
  chainWebpack: config => {
    config
      .plugin('BundleTracker')
      .use(BundleTracker, [{ filename: 'webpack-stats.json' }]);
  }
};
