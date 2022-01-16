<template>
  <div>
    <div style="height: 200px"></div>
    <el-table :data="tableData" style="width: 100%" max-height="400" size="large" class="table2">
      <el-table-column fixed type="index" width="50"></el-table-column>
      <el-table-column prop="date" label="Date" width="150"/>
      <el-table-column prop="name" label="Name" width="120"/>
      <el-table-column prop="state" label="State" width="120"/>
      <el-table-column prop="city" sortable label="City" width="420"/>
      <el-table-column prop="address" label="Address" width="400"/>
<!--      <el-table-column prop="img" label="Address" width="100">-->
<!--        <template v-slot>-->
<!--          <span>span</span>-->
<!--&lt;!&ndash;          <img v-lazy="1"/>&ndash;&gt;-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="Operations" width="120">
        <template v-slot="{ $index }">
          <lazy-component :key="Math.random()" out="2">
            <View2 :d="$index"/>
            <template #loading>
              <div style="height: 40px" loading>loading</div>
            </template>
          </lazy-component>
        </template>
      </el-table-column>
    </el-table>
    <div style="height: 100px;background: red" @click="click">1</div>
<!--    <el-table :data="tableData" style="width: 100%" max-height="400" size="large">-->
<!--      <el-table-column fixed prop="date" label="Date" width="150"/>-->
<!--      <el-table-column prop="name" label="Name" width="120"/>-->
<!--      <el-table-column prop="state" label="State" width="120"/>-->
<!--      <el-table-column prop="city" label="City" width="120"/>-->
<!--      <el-table-column prop="address" label="Address" width="500"/>-->
<!--      <el-table-column label="Operations" width="120">-->
<!--        <template v-slot="{ $index }">-->
<!--          <lazy-component :lazy-key="1" :key="Math.random()" :index="$index + 13">Lazy</lazy-component>-->
<!--        </template>-->
<!--      </el-table-column>-->
<!--    </el-table>-->
  </div>
</template>

<script lang="ts" setup>
import {getCurrentInstance, nextTick, onMounted, onUpdated, reactive, ref} from 'vue'
import {listener} from "@/components/LazyLoad/Lazy";
import View2 from "@/views/view2.vue";

const tableData = ref([
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    img: 'tt'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    img: 'dd'
  }
])
Array.from({length: 5}).forEach(() => tableData.value.push(...tableData.value))

function click() {
  tableData.value = tableData.value.sort(() => Math.random() - .5)
  listener()
}

onUpdated(()=> console.error('updated'))

onMounted(() => {
  // console.log(getCurrentInstance())
})
</script>

<style scoped>

</style>
