
var console = require('unclog');

console.log('Hello log world!');
console.err.plain('Hello plain err world!');

console.log('Hello log!');
console.silly('Hello silly!');
console.verbose('Hello verbose!');
console.info('Hello info!');
console.pass('Hello pass!');
console.start('Hello start!');
console.end('Hello end!');
console.warn('Hello warn!');
console.err('Hello err!');
console.fail('Hello fail!');
console.debug('Hello debug!');

console.log.plain('>>Hello log!');
console.silly.plain('>>Hello silly!');
console.verbose.plain('>>Hello verbose!');
console.info.plain('>>Hello info!');
console.pass.plain('>>Hello pass!');
console.start.plain('>>Hello start!');
console.end.plain('>>Hello end!');
console.warn.plain('>>Hello warn!');
console.err.plain('>>Hello err!');
console.fail.plain('>>Hello fail!');
console.debug.plain('>>Hello debug!');

// return;

// // console.log('hi log');
// // console.debug('hi debug');
// // console.log('hi log');
// // console.debug('hi debug');


var colors = require('colors');
console.log('hello blue'.blue); // outputs green text
console.log('hello green'.green); // outputs green text
console.log('i like cake and pies'.underline.red) // outputs red underlined text
console.log('inverse the color'.inverse); // inverses the color
console.log('OMG Rainbows!'.rainbow); // rainbow
console.log('Run the trap'.trap); // Drops the bass

console.log('reset'.reset); // Drops the bass

console.log('hello'.green); // outputs green text
console.log('i like cake and pies'.underline.red) // outputs red underlined text
console.log('inverse the color'.inverse); // inverses the color
console.log('OMG Rainbows!'.rainbow); // rainbow
console.log('Run the trap'.trap); // Drops the bass



var clc = require('cli-color');

// process.stdout.write(clc.erase.screen);

var msg;

console.log(clc.white('Text in white'));
console.log(clc.whiteBright('Text in whiteBright'));
console.log(clc.black('Text in black'));
console.log(clc.blue('Text in blue'));
console.log(clc.green('Text in green'));
console.log(clc.red.bgWhite.underline('Underlined red text on white background.'));
console.log(clc.red('red') + ' plain ' + clc.blue('blue'));
console.log(clc.red('red ' + clc.blue('blue') + ' red'));
// msg = clc.xterm(202).bgXterm(236);
// console.log(msg('Orange text on dark gray background'));
// // process.stdout.write(clc.reset);
// console.log(clc.red('Text in red'));
// console.log(clc.red.bgWhite.underline('Underlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white backgroundUnderlined red text on white background.'));
// console.log(clc.red('red') + ' plain ' + clc.blue('blue'));
// console.log(clc.red('red ' + clc.blue('blue') + ' red'));
// msg = clc.xterm(202).bgXterm(236);
// console.log(msg('Orange text on dark gray background'));

// // var text = '.........\n' +
// //     '. Hello .\n' +
// //     '.........\n';
// // var style = { ".": clc.yellowBright("X") };

// // process.stdout.write(clc.art(text, style));
// // process.stdout.write(clc.erase.screenRight);



// var setupThrobber = require('cli-color/throbber');

// var throbber = setupThrobber(function (str) {
//   process.stdout.write(str);
// }, 200);

// throbber.start();
// // at any time you can stop/start throbber
// throbber.stop();

