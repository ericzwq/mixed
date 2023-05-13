fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=017784bb-694b-4c6a-b246-b9af4201121b;session-id.sig=60mtJJsU1qByIaIoJ6oSC2zuX0s;'))
ws.json = (data) => ws.send(JSON.stringify(data))

ws.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})
ws.json({action: 'sendMessage', data: {target: '1-eric4', fakeId: Date.now().toString(), type: 1, content: Date.now().toString(36), lastId: null}})
ws.json({action: 'sendMessage', data: {target: '1-eric4', fakeId: Date.now().toString(), type: 5, content: 30, lastId: null}})
ws.json({action: 'getHisSgMsgs', data: {maxId: 23, count: 20, minId: null}})
ws.json({action: 'createGroup', data: {name: '群聊1', members: ['eric2', 'eric3']}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric2', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws2 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=a7eb6e3f-2ce6-4a67-b407-48b833e42ac1;session-id.sig=FxyrDMk7Vx-dg2lo9gnjZPUf6CQ;'))
ws2.json = (data) => ws2.send(JSON.stringify(data))

ws2.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric3', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws3 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=d1eb6c3a-8346-41fc-8c7d-d649a7100ba7;session-id.sig=bUU4t5rAMNNJjSVU7OcpkZOOz04;'))
ws3.json = (data) => ws3.send(JSON.stringify(data))

ws3.json({action: 'addUserRet', data: {friendAplId: 2, contactId: 28, to: 'eric', status: 1, remark: 'remark2'}})
ws3.json({action: 'readSgMsgs', data: {ids: [5, 6], to: 'eric'}})