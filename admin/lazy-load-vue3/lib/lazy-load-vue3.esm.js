var index = () => {
    console.log(`the answer is ${'sadf'}`);
};
let c = 3;
const arr = [1, 2];
const [a, b] = arr;
console.log(a, b, c, arr?.a);
async function f() {
    const r = await fetch('asfd');
    console.dir(r);
}

export default index;
export { f };
