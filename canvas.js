/**
 * Create a new Canvas object
 * From node-canvas browser.js
 * @param {number} width
 * @param {number} height
 * @returns {HTMLElement}
 */
exports.createCanvas = function(width, height) {
    return Object.assign(document.createElement('canvas'), { width, height });
};
