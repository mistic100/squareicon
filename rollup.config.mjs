import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json' assert { type: 'json' };

export default {
    input: 'index.js',
    output: {
        file: 'browser.js',
        name: 'squareicon',
        format: 'umd',
        sourcemap: true,
        globals: {
            'randomcolor': 'randomColor',
        },
        banner: `/*!
 * ${pkg.name} (v${pkg.version})
 * @copyright 2018-${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.email}>
 * @licence ${pkg.license}
 */`,
    },
    external: [
        'randomcolor',
    ],
    plugins: [
        replace({
            delimiters: ['', ''],

            'const { createCanvas } = require(\'canvas\');': 'const { createCanvas } = require(\'./canvas\');',
            'const { createHash } = require(\'crypto\');': 'const createHash = undefined;',
        }),
        commonjs(),
    ]
};
