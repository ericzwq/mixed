import foo from "./foo";
import bar from './bar'
// src/main.js
const f = async () => {
  const r = await fetch('http://localhost')
  console.log(r)
}
console.log({foo, bar})

class a {
  c = 4
}

console.log(a, new a()?.c)
export default f
