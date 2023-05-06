fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=8a26f64a-deda-41bc-bd9d-ed3b3b8b155a;session-id.sig=touujJwSSR27s-7OpCAxFqVS_j8;'))
ws.json = (data) => ws.send(JSON.stringify(data))



fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric4', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws4 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=2e318b63-ccfb-44a4-a50e-aa1f59fe6348;session-id.sig=AGyV2CRFDVR89wIQnVo6rTgy5Mk;'))
ws4.json = (data) => ws4.send(JSON.stringify(data))