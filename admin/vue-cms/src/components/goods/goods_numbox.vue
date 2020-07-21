<template>
    <div class="mui-numbox" data-numbox-min="1" data-numbox-max="10">
        <button class="mui-btn mui-btn-numbox-minus" type="button">-</button>
        <input class="mui-input-numbox" type="number" :value="i.cou"
               @change="updateNum(i,$event)" readonly>
        <button class="mui-btn mui-btn-numbox-plus" type="button">+</button>
    </div>
</template>

<script>
    export default {
        name: "goods_numbox",
        props: ['i'],
        methods: {
            updateNum(i, e) { //获取当前数量值
                // let value = parseInt(this.$mui('.mui-numbox').numbox().getValue()); //似乎有什么bug
                let value = parseInt(e.target.value);
                value = value > 10 ? 10 : value; // 最大数量10
                this.$store.commit('addGoods', {id: i.id, cou: value});
            },
        },
        mounted() {
            this.$mui('.mui-numbox').numbox();
        }
    }
</script>

<style scoped>
    .mui-numbox {
        height: 28px;
    }
</style>