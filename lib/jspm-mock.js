'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
    mockFromObject: function mockFromObject(module, fakeModule) {
        this.reset(module);
        module = System.normalizeSync(module);
        System.set(module, System.newModule(fakeModule));
        this.mocks[module] = true;
    },
    get: function get(module) {
        module = System.normalizeSync(module);
        if (!this.mocks[module]) {
            this.reset(module);
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
    reset: function reset(module, userTriggered) {
        module = System.normalizeSync(module);
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

exports.default = function () {
    var api = Public;
    var privateInstance = new Private();
    api.__private__ = privateInstance;
    return Object.freeze(api);
}();