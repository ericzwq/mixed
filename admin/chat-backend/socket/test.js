fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=017784bb-694b-4c6a-b246-b9af4201121b;session-id.sig=60mtJJsU1qByIaIoJ6oSC2zuX0s;'))
ws.json = (data) => ws.send(JSON.stringify(data))

ws.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric2', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws2 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=a7eb6e3f-2ce6-4a67-b407-48b833e42ac1;session-id.sig=FxyrDMk7Vx-dg2lo9gnjZPUf6CQ;'))
ws2.json = (data) => ws2.send(JSON.stringify(data))

ws2.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric4', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws4 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=53d728bd-813f-4fd7-b5a6-6d326a7981b4;session-id.sig=VNj_w33PjKmzD5-lDuPg3Y8bnj0;'))
ws4.json = (data) => ws4.send(JSON.stringify(data))

ws4.json({action: 'addUserRet', data: {friendAplId: 2, contactId: 28, to: 'eric', status: 1, remark: 'remark2'}})