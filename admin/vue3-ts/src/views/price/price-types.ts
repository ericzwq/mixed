import {Component} from "vue";

// 店铺信息
export interface Shops {
  id: number
  name: string
}

// 列表搜索参数
export interface SearchParams {
  shopId: number
  pageSize: number
  index: number
  itemStatus: number
  pricingType: number
}

// 店铺信息
export interface ShopInfo {
  shopName: string
  shopId: number
  region: string
}

export const enum PricingType {
  all = -1, // 全部
  noPrice = 0, // 未调价
  autoPrice = 1, // 自动调价
  limitPrice = 2 // 限量调价
}

export interface AutoPriceUrls {
  url: string
  name: string
}

// 限量调价销售记录
export interface LimitOrder {
  orderSn: string
  createTime: string
  modelQuantityPurchased: number
  modelDiscountedPrice: number
}

// 限量调价销售记录头信息
export interface LimitTitle {
  modelPromotionPrice: number
  modelPromotionStock: number
}

// 自动调价销售记录
export interface AutoOrder {
  lowestPrice: number
  wavePrice: number
  list: AutoPriceUrls[]
}

// sku数据
export interface SkuRow extends AutoOrder {
  modelId: string,
  modelSku: string
  // option: number
  currentPrice: number
  originalPrice: number
  currentStock: number
  normalStock: number
  pricingType: PricingType
  startTime: string
  promotionPrice: number
  orderList: LimitOrder[]
  limitOrderTitle: LimitTitle[]
  getOrder: boolean
}

// 自动调价销售记录返回信息
export interface AutoPriceData {
  title: AutoOrder
}

// 限量调价销售记录返回信息
export interface LimitPriceData {
  content: LimitOrder[]
  title: LimitTitle[]
}

// 表格行数据
export interface ItemRow {
  shopId: number
  itemId: string
  itemStatus: number
  itemName: string
  image: string
  modelList: Array<SkuRow>
  showText: string
  spread: boolean
  icon: Component
  maxPricingIndex: number
  totalPricing: number
}

// 限量调价填写的表格数据
export interface LimitPriceRow {
  model_id: string
  current_price: number
  model_promotion_price: number
  model_promotion_stock: number
}

// 自动调价头部表单数据
export interface AutoPriceHeadFrom {
  lowestPrice: string
  wavePrice: string
}

// 自动调价填写的表格数据
export interface AutoPriceRow {
  name: string
  url: string
}
