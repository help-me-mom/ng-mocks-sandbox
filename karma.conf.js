// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const isCSB = !!process.env.CSB;
const isSB = !!process.env.SB;
const isLocal = !isCSB && !isSB;
const withCoverage = isLocal && !!process.env.WITH_COVERAGE;

if (isLocal) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      ...(isLocal
        ? [require('karma-chrome-launcher'), require('karma-ie-launcher'), require('karma-junit-reporter')]
        : []),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
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
      outputDir: require('path').join(__dirname, './test-reports'),
      outputFile: 'specs-junit.xml',
      useBrowserName: false,
    },
    reporters: withCoverage ? ['junit'] : isCSB || isSB ? ['kjhtml'] : ['dots', 'kjhtml'],
    hostname: isCSB ? 'random-4200.csb.app' : isSB ? 'random.github.stackblitz.io' : 'localhost',
    listenAddress: isCSB || isSB ? '0.0.0.0' : 'localhost',
    port: isCSB ? 4200 : isSB ? 80 : 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: isCSB || isSB,
    browsers: isCSB || isSB ? [] : ['ChromeCi'],
    singleRun: isLocal,
  });
};
