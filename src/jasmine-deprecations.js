(function () {
  'use strict';

  const compatibilityDeprecations = new Set([
    'Monkey patching detected. Code that overwrites parts of Jasmine, except globala and other properties that are documented as writeable, is not supported and will break in a future release.',
    "jasmine-core isn't an ES module but it was loaded as one. This is not a supported configuration.",
  ]);

  const deprecator = window.jasmine.private.Deprecator;
  const addDeprecationWarning = deprecator.prototype.addDeprecationWarning;

  deprecator.prototype.addDeprecationWarning = function (runnable, deprecation, options) {
    const message = typeof deprecation === 'string' ? deprecation : deprecation.message;

    if (!compatibilityDeprecations.has(message)) {
      return addDeprecationWarning.call(this, runnable, deprecation, options);
    }
  };
})();
