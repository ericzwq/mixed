interface a {
  name: string
}

interface b {
  age: number
}

function f(v: a | b) {
  if ((v as a).name)  {
    // v = v as a

    console.log(v.name)
  } else {
    v = v as b
    console.log(v.age)
  }
}

f({name: '2'} as a)
