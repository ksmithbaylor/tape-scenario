'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.scenario = scenario;
exports.combinations = combinations;
exports.scenarioOutline = scenarioOutline;

var _interceptStdout = require('intercept-stdout');

var _interceptStdout2 = _interopRequireDefault(_interceptStdout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

////////////////////////////////////////////////////////////////////////////////
// Helpers

function pairs(object) {
  return Object.keys(object).map(function (key) {
    return [key, object[key]];
  });
}

function onlyRunner(method) {
  return function only(test, prefix, testCases, testBody) {
    var sentinel = '__scenario.only__';
    var unhook = (0, _interceptStdout2.default)(function (line) {
      return line.includes(sentinel) ? '' : line;
    });

    test.only(sentinel, function (t) {
      t.on('end', unhook);
      method(t.test, prefix, testCases, testBody);
      t.end();
    });
  };
}

////////////////////////////////////////////////////////////////////////////////
// Scenario

function scenario(test, prefix, testCases, testBody) {
  Object.keys(testCases).forEach(function (key) {
    test(prefix + key, function (t) {
      testBody(t, testCases[key]);
    });
  });
}

scenario.only = onlyRunner(scenario);

////////////////////////////////////////////////////////////////////////////////
// Scenario Outline

function combinations(sets) {
  return pairs(sets).reduceRight(function (oldResults, _ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var setName = _ref2[0];
    var setValues = _ref2[1];
    return setValues.reduce(function (newResults, setValue, index) {
      return _extends({}, newResults, pairs(oldResults).reduce(function (newTestCases, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var oldName = _ref4[0];
        var oldValues = _ref4[1];
        return _extends({}, newTestCases, _defineProperty({}, (setName + '[' + index + '] ' + oldName).trimRight(), _extends(_defineProperty({}, setName, setValue), oldValues)));
      }, []));
    }, {});
  }, { '': {} });
}

function scenarioOutline(test, prefix, outline, testBody) {
  scenario(test, prefix, combinations(outline), testBody);
}

scenarioOutline.only = onlyRunner(scenarioOutline);