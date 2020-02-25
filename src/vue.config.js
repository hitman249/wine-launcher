module.exports = {
    devServer:        {
        compress:         true,
        disableHostCheck: true
    },
    publicPath:       '',
    outputDir:        '../app',
    configureWebpack: {
        target: 'electron-renderer',
        node:   {
            __dirname:  true,
            __filename: true,
        }
    },
};
