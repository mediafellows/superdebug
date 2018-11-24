const test = require('tape')
const nock = require('nock')
const superagent = require('superagent')
const FormData = require('form-data')
const superdebug = require('../superdebug-server')

// mock servers
nock('http://localhost')
  .get('/test-server')
  .query(true)
  .reply(200, 'simple get')
  .persist()

nock('http://localhost')
  .post('/test-server')
  .query(true)
  .reply(200, {
    token: 'asdlkfjq34958ajsdlkfkj'
  })
  .persist()

nock('http://localhost')
  .get('/echo')
  .query(true)
  .reply((uri, requestBody) => {
    return [200, uri]
  })
  .persist()

// superdebug tests -> check console
test('should call simple get', t => {
  superagent
    .get('http://localhost/test-server')
    .use(superdebug())
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.text)
      t.isEqual(result.text, 'simple get')
      t.end()
    })
})

test('should call get with query parameters', t => {
  superagent
    .get('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug())
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.text)
      t.isEqual(result.text, 'simple get')
      t.end()
    })
})

test('should call get with query object', t => {
  superagent
    .get('http://localhost/test-server?my=paramA&your=paramB')
    .query({ query: 'Manny' })
    .use(superdebug())
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.text)
      t.isEqual(result.text, 'simple get')
      t.end()
    })
})

test('should call get with query object', t => {
  superagent
    .get('http://localhost/echo?my=paramA&your=paramB')
    .query({ query: 'Manny' })
    .use(superdebug())
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.text)
      t.isEqual(result.text, '/echo?my=paramA&your=paramB&query=Manny')
      t.end()
    })
})

test('should call post endpoint', t => {
  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug())
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})

test('should call post endpoint', t => {
  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug())
    .send({ user: 'i', password: 'am' })
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})

test('should call post endpoint - with xml data', t => {
  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug())
    .set('Content-Type', 'application/xml')
    .send('<root><node-a attribute="job">nice</node-a></root>')
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})

test('should call post endpoint - with form parameters', t => {
  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug())
    .send('user=i')
    .send('password=am')
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})

test('should call post endpoint - in green', t => {
  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .type('form')
    .use(superdebug())
    .send('user=i')
    .send('password=am')
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})

test('should call post endpoint - in green', t => {
  var formData = new FormData()
  formData.append('user', 'i')
  formData.append('password', 'am')

  superagent
    .post('http://localhost/test-server?my=paramA&your=paramB')
    .use(superdebug(console.warn))
    .type('form')
    .send(formData)
    .end((err, result) => {
      if (err) return t.end(err)
      t.ok(result)
      t.ok(result.body)
      t.deepEqual(result.body, {
        token: 'asdlkfjq34958ajsdlkfkj'
      })
      t.end()
    })
})
