<template>
  <div>
    <div id="_echarts" style="height: 400px"></div>
    <img :src="src">
  </div>
</template>

<script>
import echarts from 'echarts';

export default {
  name: "detail",
  data() {
    return {
      src: () => import('../../assets/icons/icon_48.png')
    }
  },
  mounted() {
    chrome.runtime.onMessage.addListener(request => {
      console.log('detail', request)
      if (!request.hasChartData) return
      this.lineCharts(request.data)
    })
  },
  methods: {
    lineCharts(data) {
      console.log(data)
      let chartDom = document.getElementById('_echarts');
      let myChart = echarts.init(chartDom);
      let option;
      option = {
        xAxis: {
          type: 'category',
          data: data.otherDate,
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["总销售件数", "总销售件数2", "总销售件数3", "总销售件数4", "总销售件数5", "总销售件数6", "总销售件数7"]
        },
        yAxis: [
          {
            name: "总销售件数",
            type: "value",
            scale: true
          },
          {
            name: "总销售件数2",
            show: false,
            scale: true,
            type: "value"
          },
          {
            name: "总销售件数3",
            type: "value",
            show: false,
            scale: true
          },
          {
            name: "总销售件数4",
            type: "value",
            nameLocation: "end",
            show: false,
            scale: true
          },
          {
            name: "总销售件数5",
            type: "value",
            show: false,
            scale: true
          },
          {
            name: "总销售件数6",
            type: "value",
            show: false,
            scale: true
          },
          {
            name: "总销售件数7",
            type: "value",
            show: false,
            scale: true
          },
        ],
        series: [
          {
            name: '总销售件数',
            type: 'line',
            stack: '总量',
            data: data.historicalSold,
            yAxisIndex: 0,
            color: 'black'
          },
          {
            name: '总销售件数2',
            type: 'line',
            stack: '总量',
            data: data.minPriceArray,
            yAxisIndex: 1,
            color: 'red'
          },
          {
            name: '总销售件数3',
            type: 'line',
            stack: '总量',
            data: data.stock,
            yAxisIndex: 2,
            color: 'yellow'
          },
          {
            name: '总销售件数4',
            type: 'line',
            stack: '总量',
            data: data.mixPriceArray,
            yAxisIndex: 3,
            color: 'green'
          },
          {
            name: '总销售件数5',
            type: 'line',
            stack: '总量',
            data: data.view,
            yAxisIndex: 4,
            color: 'orange'
          },
          {
            name: '总销售件数6',
            type: 'line',
            stack: '总量',
            data: data.ratingsArray,
            yAxisIndex: 5,
            color: 'purple'
          },
          {
            name: '总销售件数7',
            type: 'line',
            stack: '总量',
            data: data.favoriteArray,
            yAxisIndex: 6,
            color: 'skyblue'
          }
        ]
      };
      option && myChart.setOption(option);
    }
  }
}
</script>

<style scoped>
.df {
  font-size: 3px;
}
</style>
