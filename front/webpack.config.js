var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    entry: './index.ts',
    output: {
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loaders: [
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: './tsconfig.json'
                        }
                    },
                    'angular2-template-loader?keepUrl=true'
                ]
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                use: 'raw-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.EnvironmentPlugin(["SERVER_PORT"]),
    ],
    cache: true
}
