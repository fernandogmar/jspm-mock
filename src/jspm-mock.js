'use strict'

import Exit from 'exit'
import _ from 'lodash'

function Private() {
    try { this.init() } catch (e) { this.handleError(e) }
    return this
}

Private.prototype = {
    namespace: 'jspm-mock',
    init: function () {
        this.mocks = {}
    },
    mockFromObject: function (module, fakeModule) {
        this.reset(module);
        module = System.normalizeSync(module);
        System.set(module, System.newModule(fakeModule));
        this.mocks[module] = true;
    },
    get: function (module) {
        module = System.normalizeSync(module);
        if (!this.mocks[module]) {
            this.reset(module)
        }
        return System
            .import(module)
            .catch(this.handleError)
            .then(this.getModuleContent)
    },
    getModuleContent: function (Module) {
        var moduleContent
        if (Module.module && Module.module.module) {
            moduleContent = Module.module.module
        } else {
            moduleContent = Module
        }
        return moduleContent
    },
    reset: function (module, userTriggered) {
        module = System.normalizeSync(module)
        if (userTriggered) {
            this.mocks[module] = false
        }
        if (System.has(module)) {
            System.delete(module);
        }
    },
    handleError: function (err, warning) {
        if (warning) {
            console.warn(err.message)
        } else {
            console.error(err.stack)
            Exit(1)
        }
    }
}

var Public = {
    get: function get(module) {
        return this.__private__.get.apply(this.__private__, arguments);
    },
    mock: function mock(module, fake) {
        if (!_.isString(module)) {
            throw new Error(`
                Please provide a valid module for mocking (1st argument).
                Value received is not a string: ${module}
            `)
        }
        var __private__ = this.__private__
        if (_.isObject(fake)) {
            return __private__.mockFromObject.apply(__private__, arguments);
        } else {
            throw new Error(`
                Please provide a valid mock (2nd argument).
                Value received is not a string or object: ${fake}
            `)
        }
    },
    unmock: function unmock(module) {
        var args = _.values(arguments)
        args[1] = true
        return this.__private__.reset.apply(this.__private__, args);
    }
};

export default (function () {
    var api = Public
    var privateInstance = new Private()
    api.__private__ = privateInstance
    return Object.freeze(api)
}())
