// console.log(new Buffer('ss').toString());
let q = 5, p = 3
let n = q * p
let f = (q - 1) * (p - 1)
let e = 7
let d = 1
while ((e * d) % f !== 1) {
  d++
}
console.log(d)

let c = 0
let power = 2 ** e
while (c % n !== power) { // x % 15 = 128
  c++
}
console.log(c)
