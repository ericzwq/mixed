<template>
  <el-table
      :data="tableData"
      height="800"
      border
      style="width: 100%">
    <el-table-column type="index" width="180"></el-table-column>
    <el-table-column prop="date" label="日期" width="180"></el-table-column>
    <el-table-column prop="name" label="姓名" width="180"></el-table-column>
    <el-table-column prop="address" label="地址"></el-table-column>
    <el-table-column prop="url" label="图片">
      <template v-slot="{ row }">
        <img v-lazy="row.url">
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import logo from '../assets/logo.png'
import {setLazyListenerTarget} from "../Lazy";
export default {
  data() {
    return {
      tableData: []
    }
  },
  created() {
    this.tableData.length = 200
    this.tableData = this.tableData.fill({
      date: '2016-05-03',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄',
      url: logo
    })
  },
  mounted() {
    setLazyListenerTarget(document.querySelector('.el-table__body-wrapper')) // 设置监听的元素
  }
}
</script>
