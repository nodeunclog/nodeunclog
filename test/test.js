// require('unclog/v3').global();
// var c = require('unclog/v3')({width: 9});
var c = new require('unclog/v3')({prepend: 'c'});
c.log('hi');
var d = new require('unclog/v3')({prepend: 'd'});
d.log('hi');

// require('./test2');





// // var console1 = require('unclog');
// // var console1 = {};
// // console1.log = console.log;
// // console1.debug = function(msg){
// //     console.log('debug', msg);
// // };

// // // global.console = console;
// // console.log('test1');

// // Object.defineProperty(global, 'console', {
// //     get: function() {
// //         var c = require('./');
// //         return c;
// //     },
// //     enumerable: true,
// //     configurable: true
// // });


// // require('console-ultimate/global').replace();
// console.debug('test1');





// // return;


// // var counter = 10;

// // function repeater() {
// //     if (counter-- > 0)
// //         repeater();
// //     else console.debug('hello world');
// // }
// // repeater();

// // console.log('Hello %s', 'world!');
// // console.debug('Hello %s', 'world!');
// // console.log({
// //     level1: {
// //         level2: {
// //             level3: {
// //                 level4: {
// //                     level5: {
// //                         'ok that\'s enough': true
// //                     }
// //                 }
// //             }
// //         }
// //     }
// // });

// // // var a = {}; a.err();

// // // console.log('Hello %s', 'world!', global);
// // console.info('Hey listen world, you might wanna know this...');
// // console.warn('Hey lookout world! Don\'t say I didn\'t warn you');
// // console.error('â”œâ”€â”, world.. € Iâ”œâ”€â”don\'tâ”œâ”€â”even\\');
// // // var console = require('./index')('teaaaaaaaaaaaaaa');

// // console.debug('Why aren\'t you working world, why?');
// // console.silly('World. Hey, world! HEEEY WOOOOOOORLD!!!!! ... hi! :)');
// // console.verbose('Lorem ipsum world dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
// // console.verbose('Lorem ipsum world dolor sit amet,\nconsectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
// // console.silly('Lorem ipsum world dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum world dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');



// // // console.log('Hello world!');
// // // console.log('Hello world!');
// // // console.log('Hello world!');
// // // console.log('Hello world!');
// // // console.log('Hello world!');
// // // console.log('Hello world!');



// // // var winston = require('winston');
// // // // var logger = new(winston.Logger)({
// // // //     levels: {
// // // //         silly: 0,
// // // //         verbose: 1,
// // // //         log: 2,
// // // //         info: 3,
// // // //         debug: 4,
// // // //         warn: 5,
// // // //         error: 6,
// // // //         danger: 7,
// // // //     },
// // // //     transports: [
// // // //         new(winston.transports.Console)({
// // // //             level: 'foo'
// // // //         }),
// // // //         new(winston.transports.File)({
// // // //             filename: 'somefile.log'
// // // //         })
// // // //     ],
// // // // });


// // // // logger.log('hi');

// // // var myCustomLevels = {
// // //     levels: {
// // //         foo: 0,
// // //         bar: 1,
// // //         info: 2,
// // //         foobar: 3
// // //     },
// // //     colors: {
// // //         foo: 'blue',
// // //         bar: 'green',
// // //         info: 'yellow',
// // //         foobar: 'red'
// // //     }
// // // };

// // // var customLevelLogger = new(winston.Logger)({
// // //     levels: myCustomLevels.levels,
// // //     level: 'foo',
// // //     transports: [
// // //         new(winston.transports.Console)({
// // //             level: 'foo'
// // //         }),
// // //         new(winston.transports.File)({
// // //             filename: 'somefile.log'
// // //         })
// // //     ],
// // // });
// // // customLevelLogger.foobar('some foobar level-ed message');
// // // // customLevelLogger.log('some foobar level-ed message');

// // // // require('./test2');



// // // // var winston = require('winston');

// // // // var logger = new(winston.Logger)({
// // // //     transports: [
// // // //         new(winston.transports.Console)({
// // // //             level: 'silly',
// // // //             colorize: 'true',
// // // //             label: 'category one',
// // // //         })
// // // //     ]
// // // // });
// // // // logger.log('silly', "127.0.0.1 - there's no place like home");
// // // // logger.log('debug', "127.0.0.1 - there's no place like home");
// // // // logger.log('verbose', "127.0.0.1 - there's no place like home");
// // // // logger.log('info', "127.0.0.1 - there's no place like home");
// // // // logger.log('warn', "127.0.0.1 - there's no place like home");
// // // // logger.log('error', "127.0.0.1 - there's no place like home");
// // // // logger.info("127.0.0.1 - there's no place like home");
// // // // logger.warn("127.0.0.1 - there's no place like home");
// // // // logger.error("127.0.0.1 - there's no place like home");
