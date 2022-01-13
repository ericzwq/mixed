<template>
  <div class="authorize-container">
    <el-tabs class="head-tabs" style="overflow:hidden;" v-model="activeName" type="border-card">
      <el-tab-pane label="Shopee" name="shopee">
        <el-button type="primary" @click="dialogVisible = true">添加授权</el-button>
        <el-tabs class="head-tabs hy-mt-20" style="overflow:hidden;" v-model="activeShopName"
                 type="border-card">
          <el-tab-pane label="普通店铺" name="normal">
            <el-table
                :data="tableData"
                empty-text="暂无数据"
                size="small"
                style="width: 100%">
              <el-table-column align="center" prop="shopName" label="店铺名称"
                               min-width="100"></el-table-column>
              <el-table-column align="center" prop="region" label="站点"
                               min-width="100"></el-table-column>
              <el-table-column align="center" label="是否跨境" min-width="100">
                <template v-slot="{ row }">
                  <span>{{ row.isCb ? '是' : '否' }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="shopId" label="SHOP ID"
                               min-width="100"></el-table-column>
              <el-table-column align="center" label="SIP子店铺" min-width="100">
                <el-table-column align="center" label="店铺名称"></el-table-column>
                <el-table-column align="center" label="站点"></el-table-column>
                <el-table-column align="center" label="SHOP ID"></el-table-column>
              </el-table-column>
              <el-table-column align="center" prop="authTime" label="授权时间"
                               min-width="100"></el-table-column>
              <el-table-column align="center" label="操作" min-width="100"></el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="全球店铺" name="global">
            <el-table
                :data="tableData2"
                empty-text="暂无数据"
                size="small"
                style="width: 100%">
              <el-table-column align="center" label="全球店铺名称" min-width="100">

              </el-table-column>
              <el-table-column align="center" label="SHOP ID" min-width="100">

              </el-table-column>
              <el-table-column align="center" label="关联普通店铺" min-width="100">
                <el-table-column align="center" label="普通店铺名称"></el-table-column>
                <el-table-column align="center" label="站点"></el-table-column>
                <el-table-column align="center" label="SHOP ID"></el-table-column>
              </el-table-column>
              <el-table-column align="center" label="授权时间" min-width="100">

              </el-table-column>
              <el-table-column align="center" label="操作" min-width="100">

              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
        <el-dialog
            title="添加授权"
            v-model="dialogVisible"
            width="800px">
          <el-form class="dialog-form" label-position="right" label-width="80px"
                   :model="form">
            <el-form-item label="授权类型">
              <div>
                <el-radio v-model="form.type" label="1" border size="small">普通店铺</el-radio>
                <span>按照站点店铺授权，支持普通店铺和SIP店铺，SIP店铺将同时授权SIP子店铺</span>
                <br/>
                <el-radio v-model="form.type" label="2" border size="small">全球店铺</el-radio>
                <span>子母账号形式授权，授权时候输入母账号，可刊登全球产品，一次支持授权多个站点</span>
              </div>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
            <el-button size="small" @click="dialogVisible = false">取 消</el-button>
            <el-button size="small" type="primary" @click="handleConfirm">确 定</el-button>
          </span>
          </template>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="Lazada" name="lazada"></el-tab-pane>
    </el-tabs>
    <!--    <lazy-component><div class="dd0">div</div></lazy-component>-->
  </div>
</template>

<script lang="ts" setup>
  import {GET_AUTH_URL, GET_SHOP_INFO_URL} from '@/http/urls';
  import {onMounted, reactive, ref} from 'vue';
  import http from "@/http/http";

  const dialogVisible = ref(false)
  const activeName = ref('shopee')
  const activeShopName = ref('normal')
  const form = reactive({
    type: '1',
    shopName: ''
  })
  const tableData = ref([])
  const tableData2 = ref([])

  // 点击确定
  async function handleConfirm() {
    const res = await http.get<never, { url: string }>(GET_AUTH_URL);
    window.open(res.url, '_blank', 'width=1200, height=700');
    dialogVisible.value = false;
  }


  onMounted(() => {
    http.get(GET_SHOP_INFO_URL).then(r => {
      tableData.value = r.data;
    })
  })
</script>
