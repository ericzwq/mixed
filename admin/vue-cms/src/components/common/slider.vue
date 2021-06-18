<template>
    <mt-swipe :auto="2000" class="slider">
        <mt-swipe-item v-for="(i,idx) in list" :key="idx">
            <img :src="i.img || i.src" :class="{'full':isFull}">
        </mt-swipe-item>
    </mt-swipe>
</template>

<script>
    export default {
        name: "slider",
        props: ['list', 'isFull'],
    }
</script>

<style lang="less" scoped>
    .slider {
        text-align: center;
        height: 200px;
        background: #fff;

        img {
            height: 100%;
        }
    }

    .full {
        width: 100%;
    }

    @media (min-width: 750px) {
        .slider {
            height: 300px;
        }
    }
</style>
