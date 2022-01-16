<template>
  <div class="price-container">
    <el-tabs class="head-tabs" style="overflow:hidden;" v-model="activeName" type="border-card"
             @tab-click="handleClick">
      <el-tab-pane label="Shopee" name="shopee">
        <div class="fright">
          <el-button type="primary" class="el-btn-ft-12" @click="syncAllItem">同步全部产品</el-button>
          <el-button type="primary" class="el-btn-ft-12" @click="syncAllItem">同步调价中的产品</el-button>
        </div>
        <div class="search-item">
          <span class="search-label">店铺：</span>
          <el-radio-group v-model="searchParams.shopId" @change="shopChange" class="search-val">
            <el-radio-button :label="-1">全部</el-radio-button>
            <el-radio-button v-for="shop in shops" :key="shop.id" :label="shop.id">{{ shop.name }}</el-radio-button>
          </el-radio-group>
        </div>
        <div class="search-item hy-mt-20">
          <span class="search-label">状态：</span>
          <el-radio-group v-model="searchParams.pricingType" @change="statusChange" class="search-val">
            <el-radio-button :label="-1">全部</el-radio-button>
            <el-radio-button :label="0">未调价</el-radio-button>
            <el-radio-button :label="2">限量调价</el-radio-button>
            <el-radio-button :label="1">自动调价</el-radio-button>
          </el-radio-group>
        </div>
        <div class="search-item hy-mt-20">
          <span class="search-label">展示：</span>
          <el-radio-group v-model="showStatus" class="search-val">
            <el-radio-button label="">全部SKU</el-radio-button>
            <el-radio-button label="1">只展示调价中的SKU</el-radio-button>
          </el-radio-group>
        </div>
        <div class="hy-mt-10" style="border-bottom: 1px solid #eee"/>
        <div class="hy-mt-10">
          <div class="inline-block">
            <span class="fs-12">产品ID：</span>
            <el-input v-model="searchParams.itemId" style="width: 200px" clearable></el-input>
          </div>
          <div class="inline-block hy-ml-30">
            <span class="fs-12">价格：</span>
            <el-input v-model="searchParams.priceStart" class="db-search-input" clearable></el-input>
            <span class="db-search-break">-</span>
            <el-input v-model="searchParams.priceEnd" class="db-search-input" clearable></el-input>
          </div>
        </div>
        <div class="tx-al-r">
          <el-button class="el-btn-ft-12" type="primary" @click="getTableData">查询</el-button>
          <el-button class="el-btn-ft-12" @click="reset">重置</el-button>
        </div>
        <div class="hy-mt-10" style="border-bottom: 1px solid #eee"/>
        <el-table
            :data="tableData"
            empty-text="暂无数据"
            size="small"
            class="table hy-mt-20"
            style="width: 100%">
          <el-table-column type="index" align="center" label="序号"></el-table-column>
          <el-table-column prop="date" align="center" label="图片" min-width="150">
            <template v-slot="{ row }">
              <el-tooltip placement="right-end" effect="light">
                <template #content>
                  <img class="pic-large" :src="row.image"/>
                </template>
                <img class="pic" :src="row.image"/>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="itemName" align="left" label="标题/产品ID" min-width="120">
            <template v-slot="{ row }">
              <p class="fs-12">{{ row.itemName }}</p>
              <br/>
              <p class="color-hy-blue">{{ row.itemId }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="name" align="left" label="SKU" min-width="900">
            <template #header>
              <div style="display: flex;justify-content: space-evenly">
                <span class="item-title">SKU</span>
                <span class="item-normal l1">未调价格</span>
                <span class="item-normal">调价状态</span>
                <span class="item-normal">调后价格</span>
                <span class="item-normal l4">调价开始时间</span>
                <span class="item-normal l5">调价要求/销售记录（此列中的价格为调后价格）</span>
                <span class="item-normal l6">操作</span>
              </div>
            </template>
            <template v-slot="{ row }">
              <div class="bd-bm-da-d item-box" v-for="(item, idx) in row.modelList"
                   :key="item.modelId"
                   v-show="(showStatus === '' && (row.spread || idx < DEFAULT_SKU_SHOW_COUNT)) || (showStatus !== '' && item.pricingType !== 0 && (row.spread || idx <= row.maxPricingIndex))">
                <p class="item-title">
                  {{ item.modelSku }}
                  <br/>
                  <span class="color-hy-blue">{{ item.modelId }}</span>
                </p>
                <p class="item-normal l1">{{ item.originalPrice }}</p>
                <p class="item-normal">{{ skuStatusMap[item.pricingType] }}</p>
                <p class="item-normal">{{ item.pricingType ? item.currentPrice : '--' }}</p>
                <p class="item-normal l4 fs-12">{{ item.startTime || '--' }}</p>
                <div class="item-normal l5">
                  <div>
                    <!-- 懒加载获取销售记录 -->
                    <lazy-component :key="item.key">
                      <Records :item="item" :row="row" :skuIndex="idx" :setOrderList="setOrderList"/>
                    </lazy-component>
                    <div v-if="item.pricingType === 2 && item.limitOrderTitle.length" class="bd-bm-da-d">
                      限量调价：
                      <span v-for="(title, i) in item.limitOrderTitle" :key="i">价格:{{
                          title.modelPromotionPrice
                        }}，{{ title.modelPromotionStock }}件；</span>
                    </div>
                    <div v-if="item.pricingType === 1">
                      <p class="bd-bm-da-d">自动调价：<span>最低价:{{ item.lowestPrice }}；</span><span>变动:{{
                          item.wavePrice
                        }}元</span></p>
                      <a v-for="(v,i2) in item.list" :href="v.url" target="_blank" class="color-hy-blue"
                         :key="i2">{{ v.name }}；</a>
                    </div>
                    <div v-if="!item.limitOrderTitle.length">--</div>
                    <div v-if="item.orderList.length">
                      <span v-for="(order, idx2) in item.orderList.slice(0,DEFAULT_ORDER_SHOW_COUNT)"
                            :key="order.orderSn">
                        <br v-if="idx2 !== 0"/>
                        <span>{{ order.createTime }} {{
                            order.modelQuantityPurchased
                          }}件  价格:{{ order.modelDiscountedPrice }}；</span>
                      </span>
                      <el-popover
                          placement="bottom"
                          title="销售记录"
                          width="300"
                          trigger="click">
                        <span v-for="(order, idx2) in item.orderList" :key="order.orderSn">
                        <br v-if="idx2 !== 0"/>
                        <p>{{ order.createTime }} {{ order.modelQuantityPurchased }}件 价格:{{
                            order.modelDiscountedPrice
                          }}；</p>
                      </span>
                        <template #reference>
                          <el-button v-show="item.orderList.length > DEFAULT_ORDER_SHOW_COUNT" class="hy-ml-10"
                                     :icon="ArrowDown" type="text" size="small">
                            更多
                          </el-button>
                        </template>
                      </el-popover>
                    </div>
                  </div>
                </div>
                <p class="item-normal l6">
                  <el-button type="text" size="small" @click="() => limitAdjust(row, item)">限量调价</el-button>
                  <br/>
                  <el-button type="text" size="small" @click="() => autoAdjust(row, item)">自动调价</el-button>
                  <br/>
                  <el-button :disabled="item.pricingType === 0" type="text" size="small"
                             @click="() => cancelAdjust(row, item)">取消调价
                  </el-button>
                </p>
              </div>
              <el-button
                  v-if="(showStatus === '' && row.modelList.length > DEFAULT_SKU_SHOW_COUNT) || (showStatus !== '' && row.totalPricing > DEFAULT_SKU_SHOW_COUNT)"
                  class="fright" :icon="row.icon" type="text" size="small"
                  @click="() => showMoreOrLess(row)">
                {{ row.showText }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            class="fright hy-mt-15"
            background
            :current-page="searchParams.index"
            :pager-count="7"
            :page-size="searchParams.pageSize"
            @size-change="(pageSize)=> getTableData({pageSize})"
            @current-change="(index) => getTableData({index})"
            layout="sizes, prev, pager, next, total"
            :page-sizes="[20, 50, 100]"
            :total="total">
        </el-pagination>
      </el-tab-pane>
      <el-tab-pane label="Lazada" name="lazada"></el-tab-pane>
    </el-tabs>
    <el-dialog
        title="限量调价"
        custom-class="adjust-dialog"
        v-model="dialogVisible"
        width="50%">
      <el-table
          :data="dialogTableData"
          style="width: 100%">
        <el-table-column prop="current_price" align="center" label="价格"></el-table-column>
        <el-table-column align="center" label="调后价格" min-width="100">
          <template v-slot="{ row }">
            <el-input v-model.trim.number="row.model_promotion_price" clearable></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" label="件数" min-width="100">
          <template v-slot="{ row }">
            <el-input v-model.trim.number="row.model_promotion_stock" clearable></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
            <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="limitAdjustConfirm">确 定</el-button>
          </span>
      </template>
    </el-dialog>
    <el-dialog
        title="自动调价"
        custom-class="adjust-dialog2"
        top="10vh"
        v-model="dialogVisible2"
        width="80%">
      <el-form inline :model="autoAdjustForm" :rules="rules" ref="autoAdjustFormRef">
        <el-form-item label="价格：">
          <span class="hy-mr-40">{{ curSku.originalPrice }}</span>
        </el-form-item>
        <el-form-item label="最低价：" prop="lowestPrice">
          <el-input v-model.trim="autoAdjustForm.lowestPrice" clearable></el-input>
        </el-form-item>
        <el-form-item label="变动：" prop="wavePrice">
          <el-input v-model.trim="autoAdjustForm.wavePrice" clearable></el-input>
        </el-form-item>
      </el-form>
      <el-table
          :data="dialogTableData2"
          style="width: 100%">
        <el-table-column prop="name" align="center" label="名称" min-width="50">
          <template v-slot="{ row }">
            <el-input v-model.trim="row.name" clearable></el-input>
          </template>
        </el-table-column>
        <el-table-column prop="url" align="center" label="链接" min-width="100">
          <template v-slot="{ row }">
            <el-input v-model.trim="row.url" clearable></el-input>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
            <span class="dialog-footer">
            <el-button @click="dialogVisible2 = false">取 消</el-button>
            <el-button type="primary" @click="autoAdjustConfirm">确 定</el-button>
          </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import {
  AUTO_LIMIT_PRICE_URL,
  CANCEL_PRICEING_URL,
  GET_ITEM_INFO_URL,
  GET_SHOP_INFO_URL, LIMIT_PRICEING_URL,
  SYNC_ITEM_DATA_URL
} from '@/http/urls';
import {Loading} from '@/common/utils';
import {markRaw, onMounted, reactive, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import http from "@/http/http";
import {LooseObject, SuccessResponse} from '@/types/types';
import {AutoPriceFrom, AutoPriceRow, ItemRow, LimitPriceRow, ShopInfo, Shops, SkuRow} from './price-types';
import {SHOPEES, SHOPEES2, SHOPEE_SHOP_REGION_COUNTRY_MAP} from "@/common/consts";
import {ArrowDown, ArrowUp} from "@element-plus/icons-vue";
import Records from './Records.vue';

const activeName = ref('shopee')
const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
const dialogTableData = ref([{}, {}, {}, {}, {}] as LimitPriceRow[])
const dialogTableData2 = ref([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}] as AutoPriceRow[])
const tableData = ref([] as ItemRow[])
const total = ref(0)
const showStatus = ref('') // 展示sku状态，''全部，1只展示调价中的sku
const searchParams = reactive({
  shopId: -1,
  pageSize: 2,
  index: 1,
  itemStatus: 1,
  pricingType: -1,
  itemId: '',
  priceStart: '',
  priceEnd: ''
})
const searchParamsStr = JSON.stringify(searchParams)
const curRow: ItemRow = reactive({} as ItemRow) // 当前操作的产品
const curSku = reactive({} as SkuRow) // 当前操作产品的sku
const shops = ref([] as Shops[])
const DEFAULT_SKU_SHOW_COUNT = 5 // 默认展示单个产品sku最多数量
const skuStatusMap = {
  0: '未调价',
  1: '自动调价',
  2: '限量调价'
}
const spreads = {
  more: false,
  less: true
}
const showTexts = {
  more: '展开',
  less: '收起'
}
const showIcons = {
  more: markRaw(ArrowDown),
  less: markRaw(ArrowUp)
}
const DEFAULT_ORDER_SHOW_COUNT = 2 // 默认展示单个产品sku最多销售记录
const autoAdjustForm: AutoPriceFrom = reactive({
  lowestPrice: '',
  wavePrice: ''
})
const rules = {
  lowestPrice: [
    {required: true, message: '请填写最低价', trigger: 'blur'},
    {pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效价格且最多输入2位小数', trigger: 'change'}
  ],
  wavePrice: [
    {required: true, message: '请填写变动价格', trigger: 'blur'},
    {pattern: /^\d+(\.\d{1,2})?$/, message: '请输入有效价格且最多输入2位小数', trigger: 'change'}
  ]
}
const autoAdjustFormRef = ref()

const SHOP_ID_REGION_MAP: LooseObject = {}

// 自动调价确定
function autoAdjustConfirm() {
  autoAdjustFormRef.value.validate((valid: boolean) => {
    if (!valid) return
    let urlList = dialogTableData2.value.filter(v => v.url && v.url.startsWith('http')).map(v => {
      return {name: v.name, url: v.url}
    })
    if (!urlList.length) return ElMessage.error('请至少有效填写一行数据');
    const {shopId, itemId} = curRow, {modelId} = curSku,
        country = SHOPEE_SHOP_REGION_COUNTRY_MAP[SHOP_ID_REGION_MAP[shopId]]
    // let url = urlList[0].url.match(/https?:\/\/([\w.]+)\//)[1]
    let nameIndex = 1
    urlList = urlList.filter(v => {
      let flag = v.url.includes(SHOPEES[country - 1]) || v.url.includes(SHOPEES2[country - 1])
      if (flag && !v.name) v.name = '链接' + nameIndex++
      return flag
    })
    if (!urlList.length) return ElMessage.error('请填写与当前店铺相同国家的链接');
    const form = {} as Record<keyof AutoPriceFrom, number>
    for (let k in autoAdjustForm) form[k as keyof AutoPriceFrom] = +autoAdjustForm[k as keyof AutoPriceFrom]
    const params = {
      country,
      ...form,
      shopId,
      itemId,
      modelId,
      pricingType: 1,
      urlList
    }
    http.post<never, SuccessResponse>(AUTO_LIMIT_PRICE_URL, params).then(r => {
      if (r.code === 1) ElMessage.success(r.msg)
      else ElMessage.error(r.msg)
      dialogVisible2.value = false
      getTableData()
    })
  });
}

// 设置销售记录
function setOrderList(data: LooseObject, row: LooseObject, item: LooseObject) {
  if (data.content?.length || data.title?.length) {
    item.orderList = data.content || [];
    item.orderTitle = data.title || [];
    item.key = item.modelId;
  }
}

// 限量调价确定
function limitAdjustConfirm() {
  console.log('limit')
  // const {curRow: {shopId, itemId}, curSku: {modelId}} = this,
  const {shopId, itemId} = curRow.value, {modelId} = curSku.value,
      modelList = dialogTableData.value.filter(i => i.model_promotion_price && i.model_promotion_stock), // 过滤不完整数据
      params = {
        shopId,
        itemId,
        type: 2,
        modelList
      };
  if (!modelList.length) return ElMessage.error('请至少有效填写一行数据')
  if (modelList.some(i => !(/^\d[\d,.]*/).test(i.model_promotion_price + '') || !(/^\d+$/).test(i.model_promotion_stock + '')))
    return ElMessage.error('请正确填写输入的值')
  modelList.forEach(i => i.model_id = modelId)
  http.post<never, SuccessResponse>(LIMIT_PRICEING_URL, params).then(r => {
    if (r.code === 1) {
      ElMessage.success(r.msg);
      dialogVisible.value = false;
      getTableData();
    } else {
      ElMessage.error(r.msg);
    }
  });
}

// 同步全部产品
function syncAllItem() {
  Loading.open(true)
  http.post<never, number>(SYNC_ITEM_DATA_URL, {
    shopId: searchParams.shopId
  }).then(r => {
    let total = r * 2, i = 1, timer = setInterval(() => {
      Loading.vm.setText(`加载中，时间可能较长，请耐心等待（${(i / total * 100).toFixed(0)}%）`)
      if (++i === total) {
        getTableData();
        clearInterval(timer);
      }
    }, 500);
  });
}

// sku展开或收起
function showMoreOrLess(row: ItemRow) {
  const key = row.showText === showTexts.more ? 'less' : 'more';
  row.showText = showTexts[key];
  row.spread = spreads[key];
  row.icon = showIcons[key];
}

function getTableData(params = {}) { // 参数覆盖，同步更新记录中的searchParams
  http.post<never, SuccessResponse<ItemRow[]>>(GET_ITEM_INFO_URL, Object.assign(searchParams, params)).then(r => {
    Loading.close()
    tableData.value = r.data
    total.value = r.total
    tableData.value.forEach(i => {
      i.maxPricingIndex = i.modelList.length - 1
      i.showText = showTexts.more
      i.icon = showIcons.more
      let count = 0
      i.modelList.forEach((model, idx) => {
        if (model.pricingType !== 0 && ++count === DEFAULT_SKU_SHOW_COUNT) i.maxPricingIndex = idx // 设置只展示调价的sku时最大显示的索引
        model.orderList = []
        model.limitOrderTitle = []
        model.key = Math.random()
      });
      i.totalPricing = count // 单个产品调价中的sku总数
    })
  })
}

// 切换状态
function statusChange(pricingType: number) {
  resetSearch();
  getTableData({pricingType});
}

// 重置表格上方搜索条件
function reset() {
  const params = JSON.parse(searchParamsStr)
  params.pageSize = searchParams.pageSize
  params.index = searchParams.index
  params.shopId = searchParams.shopId
  Object.assign(searchParams, params)
}

// 重置分页相关搜索条件
function resetSearch() {
  searchParams.pageSize = 20
  searchParams.index = 1
}

// 切换店铺
function shopChange(shopId: number) {
  resetSearch();
  getTableData({shopId});
}

// 获取店铺信息
function getShopData() {
  http.post<never, SuccessResponse<ShopInfo[]>>(GET_SHOP_INFO_URL).then(r => {
    shops.value = r.data.map(i => {
      SHOP_ID_REGION_MAP[i.shopId] = i.region
      return {
        name: i.shopName,
        id: i.shopId
      }
    })
    searchParams.shopId = shops.value.length ? (shops.value[0]).id : -1; // 默认选第一个店铺
    getTableData()
  })
}

// 更新当前行操作的对象
function setCurRow(row: ItemRow, sku: SkuRow) {
  curRow.value = row; // todo
  curSku.value = sku;
}

// 点击限量调价
function limitAdjust(row: ItemRow, sku: SkuRow) {
  setCurRow(row, sku);
  dialogVisible.value = true;
  dialogTableData.value.forEach(i => {
    i.current_price = sku.originalPrice;
  });
}

// 点击自动调价
function autoAdjust(row: ItemRow, sku: SkuRow) {
  setCurRow(row, sku);
  dialogVisible2.value = true;
}

// 取消调价
function cancelAdjust(row: ItemRow, sku: SkuRow) {
  setCurRow(row, sku);
  ElMessageBox.confirm('确定取消调价?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    http.post<never, SuccessResponse>(CANCEL_PRICEING_URL, {
      shopId: curRow.value.shopId,
      modelId: curSku.value.modelId
    }).then(r => {
      if (r.code === 1) {
        ElMessage.success(r.msg);
      } else {
        ElMessage.error(r.msg);
      }
      getTableData();
    });
  });
}

function handleClick() {
  console.log('handle click')
}

onMounted(() => {
  Loading.open(true)
  getShopData();
})
</script>

<style lang="scss" scoped>
.price-container {
  margin-left: 20px;
  box-shadow: 0 0 5px #ccc;

  .search-item {
    display: flex;
    align-items: center;

    .search-label {
      font-size: 13px;
      line-height: 32px;
    }

    .search-val {
      :deep(.el-radio-button__inner) {
        font-size: 12px;
      }
    }
  }

  .head-tabs {
    border: none;
    height: 100%;

    :deep(.el-tabs__content) {
      padding-left: 20px;
    }
  }

  .table {
    border-bottom: none;

    .pic {
      display: block;
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }

    .item-box {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      line-height: 2.5;
    }

    .item-title, .item-normal {
      display: inline-block;
    }

    .item-title {
      width: 80px;
    }

    .item-normal {
      flex: 60px 1;
      text-align: center;

      &.l1 {
        flex-basis: 50px;
      }

      &.l4 {
        flex-basis: 75px;
      }

      &.l5 {
        display: flex;
        justify-content: center;
        flex: 350px 8;

        & > div {
          margin: 0 auto;
          text-align: left;
        }
      }

      &.l6 {
        flex-basis: 50px;
      }
    }
  }

}

.adjust-dialog {

  .title {
    border-bottom: 1px solid #ccc;
  }
}
</style>

<style lang="scss">
.table td.el-table__cell {
  border-bottom-color: #ccc !important;
}

.adjust-dialog, .adjust-dialog2 {
  min-width: 750px;
}

.pic-large {
  display: block;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}

.dialog-form {
  //.el-form-item {
  //  width: 24%;
  //
  //  .el-form-item__content {
  //    width: calc(100% - 80px);
  //  }
  //}
}
</style>
