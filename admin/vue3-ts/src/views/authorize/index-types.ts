// 店铺信息
import {Ref} from "vue";

export interface LoadingInstance {
  setText: (text: string) => void;
  remvoeElLoadingChild: () => void;
  close: () => void;
  handleAfterLeave: () => void;
  vm: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}>>;
  $el: HTMLElement;
  originalPosition: import("vue").Ref<string>;
  originalOverflow: import("vue").Ref<string>;
  visible: import("vue").Ref<boolean>;
  parent: import("vue").Ref<import("element-plus/src/types").LoadingParentElement>;
  background: import("vue").Ref<string>;
  svg: import("vue").Ref<string>;
  svgViewBox: import("vue").Ref<string>;
  spinner: import("vue").Ref<string | boolean>;
  text: import("vue").Ref<string>;
  fullscreen: import("vue").Ref<boolean>;
  lock: import("vue").Ref<boolean>;
  customClass: import("vue").Ref<string>;
  target: import("vue").Ref<HTMLElement>;
  beforeClose?: import("vue").Ref<(() => boolean) | undefined> | undefined;
  closed?: import("vue").Ref<(() => void) | undefined> | undefined;
}

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
}

// 限量调价填写的数据
export interface LimitPriceRow extends Ref {
  current_price: number
  model_promotion_price: number
  model_promotion_stock: number
}
