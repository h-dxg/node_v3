const { defineConfig } = require("@vue/cli-service");


module.exports = defineConfig({

  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.md$/,
          exclude: /src/,
        }
      ]
    }
  },
  publicPath: process.env.NODE_ENV !== 'production' ? '/' : '/',//生成环境和本地服务环境路径不同
  // devServer: {
  //   allowedHosts: 'all',
  //   host: '0.0.0.0',
  //   port: 8080,
  // },
  devServer: {
    historyApiFallback: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: process.env.VUE_APP_SERVER_URL,
      },
    }
  },
  transpileDependencies: true,
  lintOnSave: false,
});
