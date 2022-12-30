import { babel } from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json' assert { type: 'json' };

export default {
    input   : 'index.js',
    output  : {
        file     : 'browser.js',
        name     : 'squareicon',
        format   : 'umd',
        sourcemap: true,
        globals  : {
            'randomcolor': 'randomColor',
            'md5'        : 'md5',
        },
        banner   : `/*!
 * ${pkg.name} (v${pkg.version})
 * @copyright 2018-${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.email}>
 * @licence ${pkg.license}
 */`,
    },
    external: [
        'md5',
        'randomcolor',
    ],
    plugins : [
        replace({
            delimiters: ['', ''],

            'const { createCanvas } = require(\'canvas\');': 'const { createCanvas } = require(\'./canvas\');',
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
    ]
};
