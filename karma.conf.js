// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const isCSB = !!process.env.CSB;
const isSB = !!process.env.SB;
const isLocal = !isCSB && !isSB;
const sandboxListenAddress = isLocal ? 'localhost' : '0.0.0.0';
const withCoverage = isLocal && !!process.env.WITH_COVERAGE;
const path = require('path');

module.exports = async function (config) {
  if (isLocal) {
    process.env.CHROME_BIN = await require('puppeteer').executablePath({ headless: 'shell' });
  }

  const testMainIndex = config.files.findIndex(file => file.pattern.endsWith('test_main.js'));

  if (testMainIndex === -1) {
    throw new Error('Could not place the Jasmine deprecation filter before test_main.js');
  }

  config.files.splice(testMainIndex, 0, {
    pattern: path.join(__dirname, 'src/jasmine-deprecations.js'),
    included: true,
    served: true,
    watched: false,
  });

  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      ...(isLocal
        ? [require('karma-chrome-launcher'), require('karma-ie-launcher'), require('karma-junit-reporter')]
        : []),
      require('karma-jasmine-html-reporter'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      },
    },
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
      IECi: {
        base: 'IE',
        flags: ['-extoff'],
      },
    },
    junitReporter: {
      outputDir: path.join(__dirname, './test-reports'),
      outputFile: 'specs-junit.xml',
      useBrowserName: false,
    },
    reporters: withCoverage ? ['junit'] : isCSB || isSB ? ['kjhtml'] : ['dots', 'kjhtml'],
    hostname: 'localhost',
    listenAddress: sandboxListenAddress,
    port: isCSB ? 4200 : isSB ? 80 : 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: isCSB || isSB,
    browsers: isCSB || isSB ? [] : ['ChromeCi'],
    singleRun: isLocal,
  });
};
