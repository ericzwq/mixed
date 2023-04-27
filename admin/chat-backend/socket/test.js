fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=0ea6bae4-f2e4-49c2-b12a-8c7e55192737;session-id.sig=mb7q02rf9YBKPygTvi9DHBwip5s;'))
ws.json = (data) => ws.send(JSON.stringify(data))



fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric4', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws2 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=9446be9f-7c1a-4bd4-8bfc-3d60cee2a6a4;session-id.sig=fZV6wEI7DfUZF761yUBKGETP3Ng;'))
ws2.json = (data) => ws2.send(JSON.stringify(data))