<template>
    <div>
        <h1>test---{{ mes }}</h1>
    </div>
</template>

<script>
    export default {
        name: "test",
        data() {
            return {mes: 123}
        },
        methods: {
            test() {
                console.log('test')
            }
        }
    };
    export let exportMes = 222;
</script>

<style>
    h1 {
        color: red
    }
</style>