const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/transform-runtime'
                        ]
                    }
                }
            },
            {
                test: /\.ohm$/,
                loader: 'ohm-loader'
            },
            {
                test: /\.sarga$/i,
                use: 'raw-loader',
            }
        ]
    },
    entry: './src/sarga_main.js',
    output: {
        filename: 'sarga.js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: 'this',
        library: {
            name: 'Sarga',
            type: 'commonjs'
        }
    },
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         template: path.resolve(__dirname, "www", "index.html")
    //     })
    // ]
};
