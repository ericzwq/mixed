export default (): void => {
  console.log(`the answer is ${'sadf'}`);
}
let c = 3
const arr = [1, 2]
const [a, b] = arr
console.log(a, b, c, (arr as any)?.a)

export async function f(): Promise<void> {
  const r = await fetch('asfd')
  console.dir(r)
}
