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

// sku数据
export interface SkuRow extends Ref {
  modelId: string,
  modelSku: string
  // option: number
  currentPrice: number
  originalPrice: number
  currentStock: number
  normalStock: number
  pricingType: number
  startTime: string
  promotionPrice: number
}

// 表格行数据
export interface ItemRow extends Ref {
  shopId: number
  itemId: string
  itemStatus: number
  itemName: string
  image: string
  modelList: Array<SkuRow>
  showText: string
  spread: boolean
  icon: Component
}

// 限量调价填写的表格数据
export interface LimitPriceRow extends Ref {
  current_price: number
  model_promotion_price: number
  model_promotion_stock: number
}

export interface AutoPriceFrom {
  lowestPrice: string
  wavePrice: string
}

// 自动调价填写的表格数据
export interface AutoPriceRow extends Ref {
  name: string
  url: string
}
