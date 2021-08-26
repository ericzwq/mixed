import Vue from "vue";
import detail from "./detail";

export function createEcharts() {
  let main = document.querySelector('.container[role="main"]')
  let card = document.querySelector('.product-briefing.flex.card')
  let div = document.createElement('div')
  div.setAttribute('id', 'shopee_detail')
  main.insertBefore(div, card)
  new Vue({
    el: '#shopee_detail',
    render: h => h(detail, {props: {country: 'ar'}})
  })
}
