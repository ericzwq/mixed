<template>
  <div class="authorize-container">
    <el-tabs class="head-tabs" style="overflow:hidden;" v-model="activeName" type="border-card">
      <el-tab-pane label="Shopee" name="shopee">
        <el-button type="primary" size="small" @click="dialogVisible = true">添加授权</el-button>
        <el-tabs class="head-tabs hy-mt-20" style="overflow:hidden;" v-model="activeShopName"
                 type="border-card">
          <el-tab-pane label="普通店铺" name="normal">
            <el-table
              :data="tableData"
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
          class="dialog"
          :visible.sync="dialogVisible"
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
            <!--            <el-form-item label="店铺名称">-->
            <!--              <el-input size="mini" v-model="form.shopName"></el-input>-->
            <!--            </el-form-item>-->
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="dialogVisible = false">取 消</el-button>
            <el-button size="small" type="primary" @click="handleConfirm">确 定</el-button>
          </span>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="Lazada" name="lazada"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { GET_AUTH_URL, GET_SHOP_INFO_URL } from '@/http/urls';

export default {
  name: 'index',
  data() {
    return {
      dialogVisible: false,
      activeName: 'shopee',
      activeShopName: 'normal',
      form: {
        type: '1',
        shopName: ''
      },
      tableData: [],
      tableData2: [],
    };
  },
  created() {
    this.$http.get(GET_SHOP_INFO_URL)
      .then(r => {
        this.tableData = r.data;
      });
  },
  methods: {
    // 点击确定
    async handleConfirm() {
      const res = await this.$http(GET_AUTH_URL);
      window.open(res.url, '_blank', 'width=1200, height=700');
      this.dialogVisible = false;
    },
  }
};
</script>

<style scoped>

</style>
