// Fetch.post('/', {a: 2}) // expected Content-Type: application/json
// Fetch.post('/', [1, 2]) // expected Content-Type: application/json
// Fetch.post('/', 1) // expected Content-Type: application/json
// Fetch.post('/', null) // expected Content-Type: application/json
// Fetch.post('/', 'null') // expected Content-Type: text/plain
// Fetch.post('/', true) // expected Content-Type: application/json
// Fetch.post('/', 'true') // expected Content-Type: text/plain
// Fetch.post('/', 'a=2') // expected Content-Type: text/plain
// Fetch.post('/', new URLSearchParams({a: '2'})) // expected Content-Type: application/x-www-form-urlencoded
// Fetch.post('/', new FormData()) // expected Content-Type: multipart/form-data

// Fetch.config.headers["Content-Type"] = 'text/plain'
// Fetch.post('/', {a: 2}, {headers: {"Content-Type": 'application/json;charset=utf8'}}) // expected Content-Type: application/json;charset=utf8
// Fetch.post('/', [1, 2]) // expected Content-Type: text/plain
// Fetch.post('/', 1, {headers: {"Content-Type": 'application/x-www-form-urlencoded'}}) // expected Content-Type: application/x-www-form-urlencoded
// Fetch.post('/', null, {headers: {"Content-Type": 'multipart/form-data'}}) // expected Content-Type: multipart/form-data
