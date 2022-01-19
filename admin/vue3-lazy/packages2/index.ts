async function f() {
  const a = await fetch('http://localhost:8080')
  console.log(a)
}
f()

export default f
