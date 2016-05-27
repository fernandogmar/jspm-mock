# jspm-mock
The "jspm-mock" module swaps any jspm module with a fake alternative. Essential for mocking dependencies in unit tests.

## Installation
```bash
npm install --save-dev jspm-mock
```
* Note: This package assumes that you already have a working copy of [jspm](https://github.com/jspm/jspm-cli) installed.

## Usage
Mock using paths:
```js
jspmMock
    .path('fs', './my-fake-fs-file')
    .then(() => {
        var module = jspmMock.get('fs')
        console.log('module', module)
    })
    .catch(console.log)
```

Mock using raw sources:
```js
jspmMock
    .source(
        'fs',
        `export default function () {
            console.log('Hello from fake module!')
        }`
    )
    .then(() => {
        var module = jspmMock.get('fs')
        console.log('module', module)
    })
    .catch(console.log)
```

## Worth Noting
Since modules are not being imported through their conventional means, the main functions might not be immidiately present in the returned variable. For example:
```js
// in esm format
import MyModule from 'somewhere'
// one expects the default import value to be the default export
MyModule() // works
// however when importing with jspmMock, this won't be the case
var MyModule = jspmMock.get('fs')
// the "MyModule" variable is not a function. It's an object with the property of "default"
MyModule.default() // is the same as "MyModule()" above.
// this addtional property (i.e. default) will vary depending on your export method and 
// the type of module being used. When in doubt, inspect the returned value!
```
