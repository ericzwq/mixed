import { AddContactPath } from "../../consts/routes";

// components/more/more.ts
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
      show: false,
      actions: [
        {
          name: '扫一扫',
          action: 'scan'
        },
        {
          name: '添加',
          action: 'add'
        }
      ]
    },

    /**
     * 组件的方法列表
     */
    methods: {
      onClose() {
        this.setData({ show: false });
      },
    
      onSelect(event: WechatMiniprogram.CustomEvent) {
        if(event.detail.action === 'add') {
          wx.navigateTo({url: AddContactPath})
        }
      },
      showSheet() {
        this.setData({show: true})
      }
    }
})
