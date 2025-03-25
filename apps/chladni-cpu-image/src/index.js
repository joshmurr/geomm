"use strict";
exports.__esModule = true;
var dom_1 = require("@geomm/dom");
var geometry_1 = require("@geomm/geometry");
var maths_1 = require("@geomm/maths");
var _09_png_1 = require("./09.png");
var gui_1 = require("./gui");
var seedImage = (0, dom_1.appendEl)('img');
seedImage.src = _09_png_1["default"];
var imageToGrayscaleArray = function (img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var imageData = ctx.getImageData(0, 0, img.width, img.height);
    var data = imageData.data;
    var grayscale = [];
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var avg = (r + g + b) / 3 / 255;
        var rescaled = avg;
        grayscale.push(rescaled);
    }
    return grayscale;
};
var ctxToGrayscaleArray = function (ctx) {
    var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    var data = imageData.data;
    var grayscale = [];
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        var avg = (r + g + b) / 3 / 255;
        var rescaled = avg;
        grayscale.push(rescaled);
    }
    return grayscale;
};
seedImage.onload = function () {
    var grayscale = imageToGrayscaleArray(seedImage);
    init(grayscale);
};
var size = (0, geometry_1.vec)(512, 512);
var settings = {
    nParticles: {
        val: 5000,
        min: 1000,
        max: 10000
    },
    drawHeatmap: { val: false, min: false, max: true },
    minWalk: { val: 2, min: 1, max: 10 },
    A: { val: 0.02, min: 0.0001, max: 0.1 },
    a: { val: 2, min: 0.1, max: 10 },
    b: { val: 1.2, min: 0.1, max: 10 },
    m: { val: 8, min: 0.1, max: 10 },
    n: { val: 4, min: 0.1, max: 10 },
    vel: { val: 7, min: 1, max: 100 }
};
var bound = function (p) {
    if (p.pos.x < 0)
        p.pos.x = (0, maths_1.randInt)(0, size.x);
    if (p.pos.x > size.x)
        p.pos.x = (0, maths_1.randInt)(0, size.x);
    if (p.pos.y < 0)
        p.pos.y = (0, maths_1.randInt)(0, size.y);
    if (p.pos.y > size.y)
        p.pos.y = (0, maths_1.randInt)(0, size.y);
};
var chladni = function (v, a, b, m, n) {
    /* chladni 2D closed-form solution - returns between -1 and 1 */
    return a * (0, maths_1.sin)(maths_1.PI * n * v.x) * (0, maths_1.sin)(maths_1.PI * m * v.y) +
        b * (0, maths_1.sin)(maths_1.PI * m * v.x) * (0, maths_1.sin)(maths_1.PI * n * v.y);
};
var move = function (p, seed, displace) {
    var a = settings.a, b = settings.b, m = settings.m, n = settings.n, vel = settings.vel, minWalk = settings.minWalk;
    var pos = (0, geometry_1.toScreen)(p.pos, size);
    var eq = seed
        ? (1 - seed[Math.floor(pos.x) + Math.floor(pos.y) * size.x]) * 1.8
        : 1;
    var di = displace ? getPixelFromCtx(displace, pos) : 1;
    var ch = chladni(p.pos, a.val, b.val, m.val, n.val) * 0.45;
    p.stochasticAmplitude = (vel.val * 0.001 + di * 0.0001) * (0, maths_1.abs)(eq + ch);
    if (p.stochasticAmplitude <= minWalk.val / 1000)
        p.stochasticAmplitude = minWalk.val / 1000;
    p.pos.x += (0, maths_1.randRange)(-p.stochasticAmplitude, p.stochasticAmplitude);
    p.pos.y += (0, maths_1.randRange)(-p.stochasticAmplitude, p.stochasticAmplitude);
    bound(p);
};
var drawRadialGradient = function (ctx, center, radius, color) {
    var gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
var MOUSE = (0, geometry_1.vec)(0, 0);
var clearCtx = function (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};
var getPixelFromCtx = function (ctx, pos) {
    var imageData = ctx.getImageData(pos.x || 0, pos.y || 0, 1, 1);
    var data = imageData.data;
    return data[0] + data[1] + data[2] / 255 / 3;
};
var drawParticle = function (p, ctx) {
    var _a = (0, geometry_1.toScreen)(p.pos, size), x = _a.x, y = _a.y;
    var sa = p.stochasticAmplitude;
    ctx.fillStyle = "hsl(".concat(sa * 720 * 2, ", 100%, 50%)");
    ctx.fillRect(x, y, 2, 2);
};
(0, gui_1.makeGui)(settings);
var init = function (seed) {
    var c = (0, dom_1.canvas)(size.x, size.y);
    (0, dom_1.appendEl)(c);
    var testCanvas = (0, dom_1.canvas)(size.x, size.y);
    (0, dom_1.appendEl)(testCanvas);
    var displaceCtx = testCanvas.getContext('2d');
    displaceCtx.fillStyle = 'black';
    displaceCtx.fillRect(0, 0, testCanvas.width, testCanvas.height);
    window.addEventListener('mousemove', function (e) { return (MOUSE = (0, geometry_1.vec)(e.offsetX, e.offsetY)); });
    var particles = Array.from({ length: settings.nParticles.max }, function () { return ({
        pos: (0, geometry_1.vec)((0, maths_1.randRange)(0, 1), (0, maths_1.randRange)(0, 1)),
        stochasticAmplitude: 0
    }); });
    var draw = function (particles, ctx) {
        clearCtx(displaceCtx);
        drawRadialGradient(displaceCtx, MOUSE, 100, 'white');
        /**/
        clearCtx(ctx);
        var slice = particles.slice(0, settings.nParticles.val);
        slice.forEach(function (p) { return move(p, seed, displaceCtx); });
        slice.forEach(function (p) { return drawParticle(p, ctx); });
        requestAnimationFrame(function () { return draw(particles, ctx); });
    };
    draw(particles, c.getContext('2d'));
};
