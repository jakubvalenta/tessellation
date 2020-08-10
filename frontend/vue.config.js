const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  // https://cli.vuejs.org/config/#publicpath
  publicPath:
    process.env.NODE_ENV === 'production'
      ? '/static/bundles/'
      : 'http://localhost:8080/static/bundles/',
  outputDir: 'dist/bundles',

  // https://cli.vuejs.org/config/#pages
  pages: {
    main: {
      entry: 'src/js/main.js'
    }
  },

  chainWebpack: config => {
    // https://github.com/owais/django-webpack-loader#assumptions
    config
      .plugin('BundleTracker')
      .use(BundleTracker, [
        { path: __dirname, filename: 'webpack-stats.json' }
      ]);

    // https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
    config.plugins.delete('html');
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
  }
};
