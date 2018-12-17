const { createCanvas } = require('canvas');
const md5 = require('md5');
const randomColor = require('randomcolor');

const MAX_COLORS = 2;
const MAX_PIXELS = 16;
const MAX_SIZE = 2048;
const MAX_PADDING_RATIO = 3;

const DEFAULT = {
    id        : null,
    hasher    : md5,
    colors    : 2,
    pixels    : 8,
    size      : 128,
    padding   : 0,
    symmetry  : 'none',
    scheme    : 'standard',
    background: 'transparent',
};

/**
 * Generates a random HEX string of specific length
 * @param {number} length
 * @returns {string}
 */
function unsecureRandom(length) {
    let out = '';
    while (out.length < length) out += Math.random().toString(16).substr(2);
    return out.substr(0, length);
}

/**
 * Loops a string and applies MD5 until a specific length
 * @param {function} hasher
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
function loopHash(hasher, str, length) {
    let out = '';
    let i = 0;
    while (out.length < length) out += hasher(str + (++i > 1 ? i : ''));
    return out.substr(0, length);
}

/**
 * Bounds a number
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function minMax(val, min, max) {
    return Math.max(min, Math.min(val, max));
}

/**
 * Parse an hexadecimal string
 * @param {string} str
 * @returns {number}
 */
function hexdec(str) {
    return parseInt(str, 16);
}

/**
 * Returns the minimim id length
 * @param {number} pixels
 * @param {number} colors
 * @returns {number}
 */
function getMinIdLength(pixels, colors) {
    // 24 bits by color + 1 or 2 bits by pixel (given MAX_COLORS = 2)
    return (colors * 24 + colors * pixels * pixels) / 4;
}

/**
 * Cleanups options
 * @param {object|string} options
 * @returns {object}
 */
function getOptions(options) {
    if (typeof options === 'string') {
        options = { id: options };
    }

    options = Object.assign({}, DEFAULT, options);

    options.colors = minMax(options.colors, 1, MAX_COLORS);
    options.pixels = minMax(options.pixels, 2, MAX_PIXELS);
    options.size = minMax(options.size, options.pixels, MAX_SIZE);
    options.padding = minMax(options.padding, 0, Math.floor(options.size / MAX_PADDING_RATIO));
    options.size = Math.round((options.size - options.padding * 2) / options.pixels) * options.pixels;

    const minIdLength = getMinIdLength(options.pixels, options.colors);

    if (!options.id) {
        options.id = unsecureRandom(minIdLength);
    }
    else {
        options.id = loopHash(options.hasher, options.id, minIdLength);
    }

    if (['none', 'horizontal', 'vertical', 'central'].indexOf(options.symmetry) === -1) {
        options.symmetry = 'none';
    }

    if (['raw', 'standard', 'bright', 'light', 'dark'].indexOf(options.scheme) === -1) {
        options.scheme = 'standard';
    }

    return options;
}

/**
 * Performs render on a new canvas
 * @param {string[]} colors
 * @param {boolean[]} sq
 * @param {boolean[]} sqc
 * @param {object} options
 * @returns {Canvas}
 */
function render(colors, sq, sqc, options) {
    let l = 0, c = 0;
    let ps = options.size / options.pixels;
    let pad = options.padding;
    let cs = options.size + 2 * options.padding;

    const canvas = createCanvas(cs, cs);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = options.background;
    ctx.beginPath();
    ctx.rect(0, 0, cs, cs);
    ctx.fill();

    for (let i = 0; i < options.pixels * options.pixels; i++) {
        if (sq[i]) {
            ctx.fillStyle = sqc[i] ? colors[0] : colors[1];
            ctx.beginPath();
            ctx.rect(pad + c * ps, pad + l * ps, ps, ps);
            ctx.fill();
        }

        c++;
        if (c === options.pixels) {
            c = 0;
            l++;
        }
    }

    return canvas;
}

/**
 * Returns the buffer or dataURL from a canvas
 * @param {Canvas} canvas
 * @param {Function<String|Buffer>} [callback]
 * @returns {String|Buffer|void}
 */
function finalize(canvas, callback) {
    if (typeof callback === 'function') {
        if (canvas.toBuffer) {
            canvas.toBuffer(callback);
        }
        else {
            callback(null, canvas.toDataURL());
        }
    }
    else {
        if (canvas.toBuffer) {
            return canvas.toBuffer();
        }
        else {
            return canvas.toDataURL();
        }
    }
}

/**
 * Read the four bits of each char in the string
 * @param {string} str
 * @returns {boolean[]}
 */
function readbits(str) {
    let bits = [];
    for (let i = 0; i < str.length; i++) {
        let tmp = hexdec(str.substr(i, 1));
        Array.prototype.push.apply(bits, [(tmp & 8) !== 0, (tmp & 4) !== 0, (tmp & 2) !== 0, (tmp & 1) !== 0]);
    }
    return bits;
}

/**
 * Applies a vertical symmetry
 * @param {Array} squares
 * @param {number} pixels
 */
function verticalSymmetry(squares, pixels) {
    for (let i = 0; i < pixels; i++) {
        let tmp = squares.slice(i * pixels, Math.floor((i + 0.5) * pixels));
        squares.splice(Math.ceil((i + 0.5) * pixels), tmp.length, ...tmp.reverse());
    }
}

/**
 * Applies an horizontal symmetry
 * @param {Array} squares
 * @param {number} pixels
 */
function horizontalSymmetry(squares, pixels) {
    for (let i = 0; i < Math.floor(pixels / 2); i++) {
        let tmp = squares.slice(i * pixels, (i + 1) * pixels);
        squares.splice((pixels - 1 - i) * pixels, tmp.length, ...tmp);
    }
}

/**
 * Returns a color for a 6 chars string
 * @param {string} str
 * @param {string} scheme
 * @returns {string}
 */
function readcolor(str, scheme) {
    if (scheme === 'raw') {
        return '#' + str;
    }
    else {
        return randomColor({
            seed      : str,
            luminosity: scheme,
            format    : 'hex',
        });
    }
}

/**
 * Creates an array with the same value
 * @param {*} value
 * @param {number} length
 * @returns {Array}
 */
function filledarray(value, length) {
    let out = [];
    while (out.length < length) {
        out.push(value);
    }
    return out;
}

/**
 * Generates a squareison
 * @param {object} options
 * @param {Function<String|Buffer>} [callback]
 * @returns {String|Buffer|void}
 */
function squareicon(options, callback) {
    options = getOptions(options);

    const colorBytes = 6;
    const pixelsBytes = options.pixels * options.pixels / 4;
    let idx = 0;

    const colors = [];
    for (let i = 0; i < options.colors; i++) {
        colors.push(readcolor(options.id.substr(idx, colorBytes), options.scheme));
        idx += colorBytes;
    }

    const squares = readbits(options.id.substr(idx, pixelsBytes));
    idx += pixelsBytes;

    const squareColors = options.colors === 2 ?
        readbits(options.id.substr(idx, pixelsBytes)) :
        filledarray(true, pixelsBytes);

    if (options.symmetry === 'vertical' || options.symmetry === 'central') {
        verticalSymmetry(squares, options.pixels);
        verticalSymmetry(squareColors, options.pixels);
    }

    if (options.symmetry === 'horizontal' || options.symmetry === 'central') {
        horizontalSymmetry(squares, options.pixels);
        horizontalSymmetry(squareColors, options.pixels);
    }

    const canvas = render(colors, squares, squareColors, options);

    return finalize(canvas, callback);
}

module.exports = squareicon;
squareicon.DEFAULT = DEFAULT;
