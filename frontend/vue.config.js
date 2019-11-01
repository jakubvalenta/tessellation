const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  publicPath: '/static/',

  chainWebpack: config => {
    config
      .plugin('BundleTracker')
      .use(BundleTracker, [{ filename: 'webpack-stats.json' }]);
  }
};
