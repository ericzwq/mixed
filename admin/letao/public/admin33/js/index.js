$(function () {
    var option1 = {
        backgroundColor: "#ffffff",
        color: ['#37A2DA'],
        animation: false,
        title: {
            text: '2020年注册人数'
        },
        legend: {
            data: ['人数']
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
            axisTick: {
                alignWithLabel: true
            }
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '人数',
            type: 'bar',
            barWidth: '70%',
            data: [10, 52, 200, 334, 390, 330, 220]
        }]
    };
    var option2 = {
        backgroundColor: "#ffffff",
        color: ["#934574", "#aa5342", "#67E0E3", "#543455", "#92CEFF", "#6084E0"],
        title: {
            text: '热门品牌销售'
        },
        legend: {
            data: ['阿迪', '耐克', '安踏', '百伦', '李宁']
        },
        series: [{
            label: {
                normal: {
                    fontSize: 18
                }
            },
            type: 'pie',
            center: ['50%', '50%'],
            data: [{
                value: 55,
                name: '阿迪'
            }, {
                value: 20,
                name: '耐克'
            }, {
                value: 10,
                name: '安踏'
            }, {
                value: 20,
                name: '百伦'
            }, {
                value: 38,
                name: '李宁'
            },
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 2, 2, 0.3)'
                }
            }
        }]
    };
    var left = echarts.init(document.getElementById('left'));
    var right = echarts.init(document.getElementById('right'));
    left.setOption(option1);
    right.setOption(option2);
});