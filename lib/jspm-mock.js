'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _exit = require('exit');

var _exit2 = _interopRequireDefault(_exit);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Private(opts) {
    try {
        this.init(opts);
    } catch (e) {
        this.handleError(e);
    }
    return this;
}

Private.prototype = {
    namespace: 'jspm-mock',
    init: function init(opts) {
        if ((typeof System === 'undefined' ? 'undefined' : _typeof(System)) !== 'object') {
            throw new Error('\n                Please make sure "jspm" is installed.\n                Global variable "System" is not an object: ' + System + '\n            ');
        }
        if (opts && !_lodash2.default.isObject(opts)) {
            throw new Error('\n                Please provide a valid configuration.\n                Value received is not an object: ' + opts + '\n            ');
        }
        this.mocks = {};
    },
    saveModule: function saveModule(module, moduleName) {
        this.mocks[System.normalizeSync(moduleName)] = module;
    },
    path: function path(realModule, fakeModule) {
        var _this = this;

        if (typeof realModule !== 'string' || typeof fakeModule !== 'string') {
            throw new Error('\n                Please provide a valid path.\n                Values received are not a string: ' + realModule + ' | ' + fakeModule + '\n            ');
        }
        var promise = System.import(System.normalizeSync(fakeModule)).catch(this.handleError).then(function (module) {
            _this.saveModule(module, realModule);
            return true;
        });
        return promise;
    },
    source: function source(realModule, fakeSource) {
        var _this2 = this;

        if (typeof realModule !== 'string' || typeof fakeSource !== 'string') {
            throw new Error('\n                Please provide a valid arguments.\n                Values received are not a string: ' + realModule + ' | ' + fakeSource + '\n            ');
        }
        var fakeModule = System.normalizeSync(this.namespace + '-' + realModule);
        if (System.has(fakeModule)) {
            System.delete(fakeModule);
        }
        System.define(fakeModule, fakeSource);
        var promise = System.import(fakeModule).catch(this.handleError).then(function (module) {
            _this2.saveModule(module.module.module, realModule);
            return true;
        });
        return promise;
    },
    get: function get(module) {
        var moduleName = System.normalizeSync(module);
        if (!this.mocks[moduleName]) {
            throw new Error('\n                Please provide a valid arguments.\n                Values received are not a string: ' + realModule + ' | ' + fakeSource + '\n            ');
        }
        return this.mocks[moduleName];
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
    path: function path(realModule, fakeModule) {
        return this.__private__.path.apply(this.__private__, arguments);
    },
    source: function source(realModule, fakeSource) {
        return this.__private__.source.apply(this.__private__, arguments);
    },
    get: function get(module) {
        return this.__private__.get.apply(this.__private__, arguments);
    }
};

exports.default = function (opts) {
    var api = Public;
    var privateInstance = new Private(opts);
    api.__private__ = privateInstance;
    return Object.freeze(api);
}();