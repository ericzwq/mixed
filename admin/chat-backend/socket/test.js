fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=1761f7d1-02eb-416a-9181-713eaf0ca12b;session-id.sig=0DNLxBs-ZTfc0Dv2d4cs0F_q024;'))
ws.json = (data) => ws.send(JSON.stringify(data))

ws.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})
ws.json({action: 'sendSgMsg', data: {to: 'eric4', fakeId: Date.now().toString(), type: 1, content: Date.now().toString(36), lastId: null}})
ws.json({action: 'sendSgMsg', data: {to: 'eric4', fakeId: Date.now().toString(), type: 5, content: 30, lastId: null}})
ws.json({action: 'getHisSgMsgs', data: {maxId: 23, count: 20, minId: null}})
ws.json({action: 'createGroup', data: {name: '群聊1', members: ['eric2', 'eric3']}})
ws.json({action: 'readGpMsgs', data: {ids: [2, 3], to: 1}})
ws.json({action: 'sendGpMsg', data: {to: 1, fakeId: Date.now().toString(), type: 1, content: Date.now().toString(36), lastId: null}})
ws.json({action: 'groupInvite', data: {to: 1, members: ['eric2', 'eric3', 'eric4']}})

fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric2', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws2 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=a7eb6e3f-2ce6-4a67-b407-48b833e42ac1;session-id.sig=FxyrDMk7Vx-dg2lo9gnjZPUf6CQ;'))
ws2.json = (data) => ws2.send(JSON.stringify(data))

ws2.json({action: 'addUser', data: {username: 'eric4', reason: 'reason', remark: 'remark'}})
ws2.json({action: 'groupInviteRet', data: {id: 5, status: 1}})
ws2.json({action: 'getGroupApls', data: {lastGroupAplId: undefined}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric3', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws3 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=d1eb6c3a-8346-41fc-8c7d-d649a7100ba7;session-id.sig=bUU4t5rAMNNJjSVU7OcpkZOOz04;'))
ws3.json = (data) => ws3.send(JSON.stringify(data))

ws3.json({action: 'addUserRet', data: {friendAplId: 2, contactId: 28, to: 'eric', status: 1, remark: 'remark2'}})
ws3.json({action: 'readSgMsgs', data: {ids: [5, 6], to: 'eric'}})


fetch(
  'https://localhost:5001/login',
  {body: JSON.stringify({username: 'eric4', password: '111111'}), method: 'POST', headers: {'Content-Type': 'application/json'}})

let ws4 = new WebSocket('wss://localhost:5001/?cookie='
  + encodeURIComponent('session-id=892e5efa-83c7-43e3-9223-186bad98c5a4;session-id.sig=cEJ6o6WW3D944c5dmfKAoiJ9X90;'))
ws4.json = (data) => ws4.send(JSON.stringify(data))
