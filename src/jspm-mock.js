'use strict'

import Fs from 'fs'
import Path from 'path'
import Exit from 'exit'
import _ from 'lodash'

function Private(opts) {
    try { this.init(opts) } catch (e) { this.handleError(e) }
    return this
}

Private.prototype = {
    namespace: 'jspm-mock',
    init: function (opts) {
        if (typeof System !== 'object') {
            throw new Error(`
                Please make sure "jspm" is installed.
                Global variable "System" is not an object: ${System}
            `)
        }
        if (opts && !_.isObject(opts)) {
            throw new Error(`
                Please provide a valid configuration.
                Value received is not an object: ${opts}
            `)
        }
        this.mocks = {}
    },
    saveModule: function (module, moduleName) {
        this.mocks[System.normalizeSync(moduleName)] = module
    },
    path: function (realModule, fakeModule) {
        if (typeof realModule !== 'string' || typeof fakeModule !== 'string') {
            throw new Error(`
                Please provide a valid path.
                Values received are not a string: ${realModule} | ${fakeModule}
            `)
        }
        var promise = System
            .import(System.normalizeSync(fakeModule))
            .catch(this.handleError)
            .then(module => {
                this.saveModule(module, realModule)
                return true
            })
        return promise
    },
    source: function (realModule, fakeSource) {
        if (typeof realModule !== 'string' || typeof fakeSource !== 'string') {
            throw new Error(`
                Please provide a valid arguments.
                Values received are not a string: ${realModule} | ${fakeSource}
            `)
        }
        var fakeModule = System.normalizeSync(this.namespace + '-' + realModule)
        if (System.has(fakeModule)) {
            System.delete(fakeModule)
        }
        System.define(fakeModule, fakeSource)
        var promise = System
            .import(fakeModule)
            .catch(this.handleError)
            .then(module => {
                this.saveModule(module.module.module, realModule)
                return true
            })
        return promise
    },
    get: function (module) {
        var moduleName = System.normalizeSync(module)
        if (!this.mocks[moduleName]) {
            throw new Error(`
                Please provide a valid arguments.
                Values received are not a string: ${realModule} | ${fakeSource}
            `)
        }
        return this.mocks[moduleName]
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
    path: function (realModule, fakeModule) {
        return this.__private__.path.apply(this.__private__, arguments)
    },
    source: function (realModule, fakeSource) {
        return this.__private__.source.apply(this.__private__, arguments)
    },
    get: function (module) {
        return this.__private__.get.apply(this.__private__, arguments)
    }
}

export default (function (opts) {
    var api = Public
    var privateInstance = new Private(opts)
    api.__private__ = privateInstance
    return Object.freeze(api)
}())
