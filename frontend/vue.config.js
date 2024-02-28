const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.188:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
})
