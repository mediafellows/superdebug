# Debug Superagent Requests - generates curl output

- logging for [superagent](https://github.com/visionmedia/superagent)
- logs in curl format
- let's you copy&paste the curl output to send to someone else
- works with node.js and in the browser with browserify or webpack
- only dependency is [debug](https://github.com/visionmedia/debug)
- works with sent `data` and `formData`

-----------
### Install

```cli
npm i -S superdebug
```

### Usage

```js
let superagent = require('superagent');
let superdebug = require('superdebug');

superagent('GET', 'http://localhost:3000/debug')
    .set({Accept: 'application/json'})
    .query({superdebug: 'is-awesome'})
    .use(superdebug(console.info))
    .timeout(10000)
    .send()
    .end()
```

### Output Log
```log
super-curl curl -v -X GET -H 'User-Agent: node-superagent/3.3.2' -H 'Accept: application/json' http://localhost:3000/debug?superdebug=is-awesome +0ms
super-debug HTTP GET 200 http://localhost:3000/debug?superdebug=is-awesome (23ms) +25ms
```

### Using Debug
 ```
 DEBUG=super-* node test/test-server.js
 ```
![superdebug-1](https://raw.githubusercontent.com/andineck/superdebug/master/superdebug-1.png)

output with json data

![superdebug-2](https://raw.githubusercontent.com/andineck/superdebug/master/superdebug-2.png)

### Options

- you can call `superdebug()` without arguments -> produces only log output with set `DEBUG` environment variable: 
  - examples: `DEBUG=super-curl` or `DEBUG=super-debug`
- or you can call `superdebug(console.info)` with your preferred logger e.g. `console.info`

```js    
superagent('GET', 'http://localhost:3000/debug')
  .use(superdebug())
```

### Test

run: 
```sh
npm test
```

### License

MIT

### Credits

- https://github.com/sebastianlzy/superagent-debugger