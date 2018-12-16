#!/usr/bin/env node

const fs = require('fs');
const squareicon = require('./index');

const yargs = require('yargs')
    .scriptName('squareicon')
    .usage('$0 [options] <path>', 'Generate a squareicon',
        (yargs) => {
            yargs.positional('path', {
                describe: 'Output filename'
            });
        },
        (options) => {
            squareicon(options, (err, buffer) => {
                if (err) {
                    throw err;
                }
                else {
                    fs.writeFileSync(options.path, buffer);
                }
            });
        }
    )
    .demandCommand(1, 'Missing required argument: path')
    .example('$0 -i mistic100 -s 128 -p 24 --px 5 -c 1 --sc light --sym vertical --bg rgb(240,240,240) mistic100.png',
        'Generates a Github like squareicon for mistic100')
    .help()
    .options({
        id        : {
            alias   : 'i',
            describe: 'Input identifier',
            type    : 'string',
        },
        colors    : {
            alias   : 'c',
            describe: 'Number of colors',
            choices : [1, 2],
            default : squareicon.DEFAULT.colors,
        },
        pixels    : {
            alias   : 'px',
            describe: 'Number of pixels',
            type    : 'number',
            default : squareicon.DEFAULT.pixels,
        },
        size      : {
            alias   : 's',
            describe: 'Desired size',
            type    : 'number',
            default : squareicon.DEFAULT.size,
        },
        padding   : {
            alias   : 'p',
            describe: 'Desired padding',
            type    : 'number',
            default : squareicon.DEFAULT.padding,
        },
        symmetry  : {
            alias   : 'sym',
            describe: 'Type of symmetry',
            choices : ['none', 'vertical', 'horizontal', 'central'],
            default : squareicon.DEFAULT.symmetry,
        },
        scheme    : {
            alias   : 'sc',
            describe: 'Colors scheme',
            choices : ['raw', 'standard', 'light', 'bright', 'dark'],
            default : squareicon.DEFAULT.scheme,
        },
        background: {
            alias   : 'bg',
            describe: 'Background color',
            default : squareicon.DEFAULT.background,
        }
    })
    .argv;
