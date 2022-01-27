<template>
  <div class="edit-limit-price-container">
    <div class="btn-box">
      <el-button type="primary" size="small" @click="publish">发布</el-button>
      <el-button size="small" @click="close">关闭</el-button>
    </div>
    <p class="title">基本信息</p>
    <el-form class="form" label-position="right" label-width="80px" ref="form"
             :model="form" :rules="rules">
      <el-form-item label="活动名称" prop="discount_name">
        <el-input size="small" class="head-input" v-model="form.discount_name" show-word-limit
                  maxlength="32"
                  clearable></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker
          size="small"
          :picker-options="pickerOptions"
          v-model="form.start_time"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker
          size="small"
          v-model="form.end_time"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
    </el-form>
    <div class="break"></div>
    <p class="title">限量调价设置</p>
    <el-table
      :data="tableData"
      class="table hy-mt-20"
      style="width: 100%">
      <el-table-column type="index" align="center" label="序号"></el-table-column>
      <el-table-column prop="date" align="center" label="图片" min-width="64">
        <template v-slot="{ row }">
          <el-tooltip placement="right-end" effect="light">
            <template #content>
              <img class="pic-large" :src="row.image.image_url_list[0]"/>
            </template>
            <img class="pic" :src="row.image.image_url_list[0]"/>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column align="left" label="标题/产品ID" min-width="200">
        <template v-slot="{ row }">
          <p class="fs-12">{{ row.itemName }}</p>
          <br/>
          <p class="fs-13 color-hy-blue">{{ row.itemId }}</p>
          <!--              <p>{{ row.itemName }}</p>-->
        </template>
      </el-table-column>
      <el-table-column prop="name" align="left" label="SKU" min-width="550">
        <template #header>
          <div class="table-head">
            <span class="item-large">SKU</span>
            <span class="item-normal center">价格</span>
            <div class="middle-box">
              <span class="item-normal1">促销价</span>
              <span class="item-normal2"></span>
              <span class="item-normal3">折扣</span>
            </div>
            <span class="item-normal center">库存</span>
          </div>
        </template>
        <template v-slot="{ row }">
          <div class="bd-bm item-box" v-for="(item, idx) in row.model.model"
               v-show="row.show || idx < 5"
               :key="item.model_id">
            <p class="item-large fs-12">{{ item.model_sku }}</p>
            <p class="item-normal center">{{
                item.price_info[0].original_price
              }}</p>
            <div class="middle-box">
              <el-input v-model="row.model_promotion_price"
                        @input="price => priceChange(item, idx, price)" class="item-normal1 input"
                        size="small"></el-input>
              <span class="item-normal2">或</span>
              <div class="item-normal3">
                <el-input v-model="item.priceOff"
                          @input="off => priceOffChange(item, idx, off)"
                          size="small" class="input"></el-input>
                %OFF（{{ item.discount || '--' }}折）
              </div>
            </div>
            <el-input class="item-normal input" size="small"></el-input>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="address" align="center" label="限购" min-width="80">
        <template v-slot="{ row }">
          <el-input v-model="row.purchaseLimit" size="small"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="address" align="center" label="操作">
        <template v-slot>
          <el-button type="text" size="mini">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'EditLimitPrice',
  data() {
    return {
      form: {
        discount_name: '',
        start_time: '',
        end_time: ''
      },
      tableData: [{
        'itemId': '5051199296',
        'itemStatus': 'NORMAL',
        'createTime': '1599391149',
        'updateTime': '1625254471',
        'itemName': 'Women Round Anti-Blue Glasses Anti-radiation Eyeglasses',
        'categoryId': '100152',
        'description': 'Eyewear Accessories:Frames\nItem Type:Eyewear Accessories\nGender:Unisex\nModel Number:15959\nFrame Material:Plastic\nPattern Type:Solid\nProduct Function:100% Protection\ngender:unisex\nProduct categories:Anti-Blue Glasses\nTexture of material:Plastic,Metal\nUsage Scope:Shopping ,Party ,Travel,T Show,Outdoor Driving\nFrame Feature:Stylish Comfortable And Not Easily Deformed Framefeature:Ultra-light\nSuitable For Face:Round Face,Long Face,Square Face,Oval Face',
        'attributeList': [
          {
            'attribute_id': 100022,
            'is_mandatory': true,
            'original_attribute_name': 'Gender',
            'attribute_value_list': [
              {
                'value_unit': '',
                'value_id': 652,
                'original_value_name': 'Female'
              }
            ]
          }
        ],
        'priceInfo': null,
        'stockInfo': null,
        'image': {
          'image_id_list': [
            'f4baeb7c51ce8fc5807858c26e518894',
            '65238ccac46b79f9c5fe7a20ee811a3b',
            '2a2a77e77eeabc658a034440cb28d936',
            '3fd3a4c52d5f27c1b74b4a4a96e6d953',
            '06f98b3ea3fb681e98ee3fa797b97523',
            'a60978a5290d0f417fae95711e2c7205',
            '8a79a510cfadd2d569f469cd32c0b72f',
            '7e6cef2da38c262b158642b9b668d517',
            'd4a25e02ce3d7e6fe172f38ad17d98e2'
          ],
          'image_url_list': [
            'https://cf.shopee.ph/file/f4baeb7c51ce8fc5807858c26e518894',
            'https://cf.shopee.ph/file/65238ccac46b79f9c5fe7a20ee811a3b',
            'https://cf.shopee.ph/file/2a2a77e77eeabc658a034440cb28d936',
            'https://cf.shopee.ph/file/3fd3a4c52d5f27c1b74b4a4a96e6d953',
            'https://cf.shopee.ph/file/06f98b3ea3fb681e98ee3fa797b97523',
            'https://cf.shopee.ph/file/a60978a5290d0f417fae95711e2c7205',
            'https://cf.shopee.ph/file/8a79a510cfadd2d569f469cd32c0b72f',
            'https://cf.shopee.ph/file/7e6cef2da38c262b158642b9b668d517',
            'https://cf.shopee.ph/file/d4a25e02ce3d7e6fe172f38ad17d98e2'
          ]
        },
        'brand': {
          'original_brand_name': 'NoBrand',
          'brand_id': 0
        },
        'hasModel': true,
        'sale': 1,
        'views': 0,
        'likes': 0,
        'ratingStar': 0,
        'commentCount': 0,
        'model': {
          'model': [
            {
              'price_info': [
                {
                  'original_price': 69,
                  'inflated_price_of_original_price': 69,
                  'current_price': 69,
                  'inflated_price_of_current_price': 69
                }
              ],
              'tier_index': [
                2
              ],
              'stock_info': [
                {
                  'stock_type': 2,
                  'current_stock': 999,
                  'normal_stock': 999,
                  'reserved_stock': 0
                },
                {
                  'stock_type': 1,
                  'current_stock': 0,
                  'normal_stock': 0,
                  'reserved_stock': 0
                }
              ],
              'promotion_id': 0,
              'model_sku': 'PH4209119-C3.BLUE',
              'model_id': 50914728437,
              'pre_order': {
                'days_to_ship': 3,
                'is_pre_order': false
              }
            },
            {
              'price_info': [
                {
                  'original_price': 69,
                  'inflated_price_of_original_price': 69,
                  'current_price': 69,
                  'inflated_price_of_current_price': 69
                }
              ],
              'tier_index': [
                0
              ],
              'stock_info': [
                {
                  'stock_type': 2,
                  'current_stock': 998,
                  'normal_stock': 998,
                  'reserved_stock': 0
                },
                {
                  'stock_type': 1,
                  'current_stock': 0,
                  'normal_stock': 0,
                  'reserved_stock': 0
                }
              ],
              'promotion_id': 0,
              'model_sku': 'PH4209119-C1.BRIGHT BLACK',
              'model_id': 50914728438,
              'pre_order': {
                'days_to_ship': 3,
                'is_pre_order': false
              }
            },
            {
              'price_info': [
                {
                  'original_price': 69,
                  'inflated_price_of_original_price': 69,
                  'current_price': 69,
                  'inflated_price_of_current_price': 69
                }
              ],
              'tier_index': [
                3
              ],
              'stock_info': [
                {
                  'stock_type': 2,
                  'current_stock': 999,
                  'normal_stock': 999,
                  'reserved_stock': 0
                },
                {
                  'stock_type': 1,
                  'current_stock': 0,
                  'normal_stock': 0,
                  'reserved_stock': 0
                }
              ],
              'promotion_id': 0,
              'model_sku': 'PH4209119-C4.PINK',
              'model_id': 50914728439,
              'pre_order': {
                'days_to_ship': 3,
                'is_pre_order': false
              }
            },
            {
              'price_info': [
                {
                  'original_price': 69,
                  'inflated_price_of_original_price': 69,
                  'current_price': 69,
                  'inflated_price_of_current_price': 69
                }
              ],
              'tier_index': [
                1
              ],
              'stock_info': [
                {
                  'stock_type': 2,
                  'current_stock': 999,
                  'normal_stock': 999,
                  'reserved_stock': 0
                },
                {
                  'stock_type': 1,
                  'current_stock': 0,
                  'normal_stock': 0,
                  'reserved_stock': 0
                }
              ],
              'promotion_id': 0,
              'model_sku': 'PH4209119-C2.SAND BLACK',
              'model_id': 50914728440,
              'pre_order': {
                'days_to_ship': 3,
                'is_pre_order': false
              }
            },
            {
              'price_info': [
                {
                  'original_price': 69,
                  'inflated_price_of_original_price': 69,
                  'current_price': 69,
                  'inflated_price_of_current_price': 69
                }
              ],
              'tier_index': [
                4
              ],
              'stock_info': [
                {
                  'stock_type': 2,
                  'current_stock': 999,
                  'normal_stock': 999,
                  'reserved_stock': 0
                },
                {
                  'stock_type': 1,
                  'current_stock': 0,
                  'normal_stock': 0,
                  'reserved_stock': 0
                }
              ],
              'promotion_id': 0,
              'model_sku': 'PH4209119-C5.GRAY',
              'model_id': 50914728441,
              'pre_order': {
                'days_to_ship': 3,
                'is_pre_order': false
              }
            }
          ],
          'tier_variation': [
            {
              'name': 'Variation',
              'option_list': [
                {
                  'image': {
                    'image_id': '929e7b4334152c635c0d3d742c5aed52',
                    'image_url': 'https://cf.shopee.ph/file/929e7b4334152c635c0d3d742c5aed52'
                  },
                  'option': 'C1.BRIGHT BLACK'
                },
                {
                  'image': {
                    'image_id': '83be8714b0e0863d5d7faf5582e27eed',
                    'image_url': 'https://cf.shopee.ph/file/83be8714b0e0863d5d7faf5582e27eed'
                  },
                  'option': 'C2.SAND BLACK'
                },
                {
                  'image': {
                    'image_id': '1324cb08c406ec3760f4ad8ffd9d58f6',
                    'image_url': 'https://cf.shopee.ph/file/1324cb08c406ec3760f4ad8ffd9d58f6'
                  },
                  'option': 'C3.BLUE'
                },
                {
                  'image': {
                    'image_id': '39a30d890728f55f46e10a6c5591991e',
                    'image_url': 'https://cf.shopee.ph/file/39a30d890728f55f46e10a6c5591991e'
                  },
                  'option': 'C4.PINK'
                },
                {
                  'image': {
                    'image_id': 'ceda7d77c564cdc14842fb19d8e3055f',
                    'image_url': 'https://cf.shopee.ph/file/ceda7d77c564cdc14842fb19d8e3055f'
                  },
                  'option': 'C5.GRAY'
                }
              ]
            }
          ]
        }
      }],
      pickerOptions: {
        // disabledDate(time) {
        //   return new Date(time).getTime() < Date.now() + 3600000;
        // }
      },
      rules: {
        discount_name: [
          {
            required: true,
            message: '请填写活动名称',
            trigger: 'blur'
          }
        ],
        start_time: [
          {
            required: true,
            message: '请选择开始时间',
            trigger: 'blur'
          }
        ],
        end_time: [{
          required: true,
          message: '请选择结束时间',
          trigger: 'blur'
        }]
      }
    };
  },
  methods: {
    // 价格改变
    priceChange(item, index, price) {

    },
    // 折扣改变
    priceOffChange(item, index, off) {
      off = +off;
      if (isNaN(off)) off = 0;
      // if (off < 0) off = 0;
      // if (off > 200) off = 200;
      item.priceOff = off;
      item.discount = ((100 - off) / 10).toFixed(1);
      item.model_promotion_price = ((100 - off) * item.original_price).toFixed(2);
      this.$set(item, index, item);
    },
    // 点击发布
    publish() {
      console.log(this);
    },
    close() {
      window.close();
    }
  },
  computed: {
    formRef() {
      return this.$refs['form'];
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-limit-price-container {
  .btn-box {
    text-align: right;
    background-color: #eee;
    height: 50px;
    line-height: 45px;
    padding-right: 20px;
  }

  .title {
    height: 50px;
    line-height: 50px;
    margin-left: 15px;
    border-bottom: 1px solid #ddd;
  }

  .break {
    height: 50px;
    background-color: #eee;
  }

  .form {
    padding: 20px;

    .head-input {
      width: 300px;
    }
  }

  .table {
    padding: 0 10px;

    .pic {
      display: block;
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }

    .table-head {
      display: flex;
      justify-content: space-evenly;
    }

    .middle-box {
      display: inline-block;
      text-align: center;
      min-width: 280px;
      font-size: 12px;

      .item-normal1 {
        display: inline-block;
        min-width: 80px;
      }

      .item-normal2 {
        display: inline-block;
        width: 30px;
      }

      .item-normal3 {
        display: inline-block;
        min-width: 170px;
      }
    }

    .item-box {
      line-height: 3.5;
      display: flex;
      justify-content: space-evenly;
    }

    .item-large {
      display: inline-block;
      min-width: 200px;
    }

    .item-normal {
      display: inline-block;
      min-width: 80px;
      text-align: center;
    }

    .input {
      width: 80px;
    }
  }
}
</style>
<style lang="scss">
.pic-large {
  display: block;
  width: 300px;
  height: 300px;
  margin: 0 auto;
}
</style>
