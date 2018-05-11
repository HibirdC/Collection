//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello ! WelCome to Collection',
    islogin: false,
    userInfo: {},
    myName:'未登录',
    myCompany:'',
    todayData:{}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
  },
  onShow: function () {
    var that = this;
    var CuserInfo = wx.getStorageSync('CuserInfo');
    if (CuserInfo.token) {
      that.setData({ myName: CuserInfo.userName });
      that.setData({ myCompany: CuserInfo.companyName });
      that.setData({ islogin: true });
    }else{
      that.setData({ islogin: false });
      that.setData({ baseInfoText: '' });
    }

    console.log(CuserInfo);
  }
})
