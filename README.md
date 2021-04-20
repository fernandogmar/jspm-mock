# jspm-mock
The "jspm-mock" module swaps any jspm module with a fake alternative. Essential for mocking dependencies in unit tests.

## Installation
```bash
jspm install npm:jspm-mock --dev
```
<sub>* Note: This package assumes that you already have a working copy of [jspm](https://github.com/jspm/jspm-cli) installed.</sub>
<sub>* It supports jspm v0.17 beta</sub>

## Usage
Import inside jspm environment (i.e. specs):
```js
import jspmMock from 'jspm-mock'
```
Get modules
```js
jspmMock.get('fs')
```
<sub>* Note: All modules except `jspm-mock` must be imported via `jspmMock.get`. Modules do NOT have to be imported before calling `jspmMock.mock`.</sub>

Mock using functions:
```js
jspmMock.mock('fs', function () {
    console.log("Testing FAKE function!")
})
//  same as...
//  jspmMock.mock('fs', function () {
//      default:  function () {
//          console.log("Testing FAKE function!")
//      }
//  })
jspmMock.get('fs').then(module => {
    console.log('module()', module())
})
.catch(console.error)
```

Mock using objects:
```js
jspmMock.mock('fs', {
    actionOne: function () {
        console.log("Testing FAKE function object one!")
    },
    actionTwo: function () {
        console.log("Testing FAKE function object two!")
    }
})
jspmMock.get('fs').then(module => {
    console.log('module.actionOne()', module.actionOne())
    console.log('module.actionTwo()', module.actionTwo())
})
.catch(console.error)
```

Unmock when the time is right:
```js
jspmMock.unmock('fs')
```

Mock, import and unmock:
```js

const mocks = {
    'fs1': {
        actionOne: function () {
            console.log("Testing FAKE function object one!")
        }
    },
    'fs2': {
        actionTwo: function () {
            console.log("Testing FAKE function object two!")
        }
    }
}

const unmock = jspmMock.mockImport(mocks)(
    ['fs1', 'fs2'], ([{actionOne}, {actionTwo}]) =>  {
        console.log('fs1.actionOne()', actionOne())
        console.log('fs2.actionTwo()', actionTwo())

        unmock()
    })
)
```
