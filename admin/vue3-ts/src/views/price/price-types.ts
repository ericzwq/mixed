import {Component, Ref} from "vue";

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

// sku数据
export interface SkuRow {
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
  orderList: Array<{
    orderSn: string
    createTime: string
    modelQuantityPurchased: number
    modelDiscountedPrice: number
  }>
  limitOrderTitle: Array<{
    modelPromotionPrice: number
    modelPromotionStock: number
  }>
  getOrder: boolean
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

export interface AutoPriceFrom {
  lowestPrice: string
  wavePrice: string
}

// 自动调价填写的表格数据
export interface AutoPriceRow {
  name: string
  url: string
}
