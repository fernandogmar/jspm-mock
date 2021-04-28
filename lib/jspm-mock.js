'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _exit = require('exit');

var _exit2 = _interopRequireDefault(_exit);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Private() {
    try {
        this.init();
    } catch (e) {
        this.handleError(e);
    }
    return this;
}

Private.prototype = {
    namespace: 'jspm-mock',
    init: function init() {
        this.mocks = {};
    },
    mockFromObject: async function mockFromObject(module, fakeModule) {
        await this.reset(module);
        module = await System.normalize(module);
        System.set(module, System.newModule(fakeModule));
        this.mocks[module] = true;
    },
    get: async function get(module) {
        module = await System.normalize(module);
        if (!this.mocks[module]) {
            await this.reset(module);
        }
        return System.import(module).catch(this.handleError).then(this.getModuleContent);
    },
    getModuleContent: function getModuleContent(Module) {
        var moduleContent;
        if (Module.module && Module.module.module) {
            moduleContent = Module.module.module;
        } else {
            moduleContent = Module;
        }
        return moduleContent;
    },
    reset: async function reset(module, userTriggered) {
        module = await System.normalize(module);
        if (userTriggered) {
            this.mocks[module] = false;
        }
        if (System.has(module)) {
            System.delete(module);
        }
    },
    handleError: function handleError(err, warning) {
        if (warning) {
            console.warn(err.message);
        } else {
            console.error(err.stack);
            (0, _exit2.default)(1);
        }
    }
};

var Public = {
    get: function get(module) {
        return this.__private__.get.apply(this.__private__, arguments);
    },
    mock: function mock(module, fake) {
        if (!_lodash2.default.isString(module)) {
            throw new Error('\n                Please provide a valid module for mocking (1st argument).\n                Value received is not a string: ' + module + '\n            ');
        }
        var __private__ = this.__private__;
        if (_lodash2.default.isObject(fake)) {
            return __private__.mockFromObject.apply(__private__, arguments);
        } else {
            throw new Error('\n                Please provide a valid mock (2nd argument).\n                Value received is not a string or object: ' + fake + '\n            ');
        }
    },
    unmock: function unmock(module) {
        var args = _lodash2.default.values(arguments);
        args[1] = true;
        return this.__private__.reset.apply(this.__private__, args);
    }
};

var Extra = {
    mockImport: function mockImport(mocks) {
        var jspmMock = this;
        var mocked_modules = jspmMock.mockModules(mocks);

        return function importPaths(paths, callback) {
            if (paths && paths.length) {
                Promise.all(paths.map(function (path) {
                    return jspmMock.get(path);
                })).then(callback);
            }

            return function () {
                return jspmMock.unmockModules(mocked_modules);
            };
        };
    },
    mockModules: function mockModules(mocks) {
        var jspmMock = this;
        return mocks && Object.entries(mocks).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                module_name = _ref2[0],
                module_mock = _ref2[1];

            jspmMock.mock(module_name, module_mock);
            return module_name;
        });
    },
    unmockModules: function unmockModules(mocked_modules) {
        var jspmMock = this;
        return mocked_modules && mocked_modules.length ? function () {
            return mocked_modules.forEach(jspmMock.unmock);
        } : function () {};
    }
};

exports.default = function () {
    var api = Public;
    var privateInstance = new Private();
    api.__private__ = privateInstance;
    return Object.freeze(Object.assign({}, api, Extra));
}();