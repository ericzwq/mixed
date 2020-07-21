<template>
  <div>
    <input type="button" value="减少" @click="minus">
    <input type="button" value="增加" @click="add">
    <br>
    <input type="text" v-model="$store.state.number">
  </div>
</template>

<script>
export default {
  methods:{
    minus(){
      this.$store.commit('minus');
    },
    add(){
      this.$store.commit('add');
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
