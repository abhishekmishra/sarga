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
                test: /\.sudina$/i,
                use: 'raw-loader',
            }
        ]
    },
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "www", "index.html")
        })
    ]
};
