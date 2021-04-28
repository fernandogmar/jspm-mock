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
    mockFromObject: async function (module, fakeModule) {
        await this.reset(module);
        module = await System.normalize(module);
        System.set(module, System.newModule(fakeModule));
        this.mocks[module] = true;
    },
    get: async function (module) {
        module = await System.normalize(module);
        if (!this.mocks[module]) {
            await this.reset(module)
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
    reset: async function (module, userTriggered) {
        module = await System.normalize(module)
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

var Extra = {
    mockImport: function mockImport(mocks) {
        const jspmMock = this;
        const mocked_modules = jspmMock.mockModules(mocks)

        return function importPaths(paths, callback) {
            if(paths && paths.length) {
                Promise.all(
                    paths.map(path => jspmMock.get(path))
                ).then(callback)
            }

            return () => jspmMock.unmockModules(mocked_modules)
        }
    },
    mockModules: function mockModules(mocks) {
        const jspmMock = this;
        return mocks && Object.entries(mocks).map(
            ([module_name, module_mock]) => {
                jspmMock.mock(module_name, module_mock)
                return module_name
            }
        )
    },
    unmockModules: function unmockModules(mocked_modules) {
        const jspmMock = this;
        return (mocked_modules && mocked_modules.length) ?
            () => mocked_modules.forEach(jspmMock.unmock) :
            () => {}
    }
}

export default (function () {
    var api = Public
    var privateInstance = new Private()
    api.__private__ = privateInstance
    return Object.freeze(Object.assign({}, api, Extra))
}())
