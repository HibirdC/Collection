import api from '../../utils/api'

Page({
  data: {
    loading: false,
    userName: "",
    mobile: "",
    companyId:"",
    error: ""
  },

  onLoad: function() {
      //需要load默认数据
  },

  bindUserNameInput: function(e) {
    this.setData({
      userName: e.detail.value
    })
  },
  bindMobileInput: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  bindCompanyIdInput: function (e) {
    this.setData({
      companyId: e.detail.value
    })
  },

  // 验证token(登录)
  isLogin: function() {
    var that = this;
    var userName = that.data.userName;
    var mobile = that.data.mobile;
    var companyId = that.data.companyId;

    //初始化error
    that.setData({ error: "" });
    if (userName === "") return;
    if (mobile === "") return;
    if (companyId === "") return;

    that.setData({ loading: true });

    api.post('bindUser', {
      code: 2000,
      userName: userName,
      mobile: mobile,
      companyId: companyId
    }, (err, res) => {
      if (res != null){
        if(res.code ===0){
          var CuserInfo = {
            userName: userName,
            mobile: mobile,
            token: res.data.token,
            companyAddr: res.data.address,
            companyName: res.data.comName
          };
          console.log(CuserInfo)
          wx.setStorageSync('CuserInfo', CuserInfo);

          that.setData({ companyName: CuserInfo.companyName });
          that.setData({ companyAddr: CuserInfo.companyAddr });

          setTimeout(function () {
            that.setData({ loading: false });
            wx.navigateTo({
              url: '/pages/index/index'
            })
            wx.navigateBack();
          }, 3000);
        }else{
          that.setData({ error: res.code + ":" + res.message});
          that.setData({ loading: false });
        }
      }else{
        that.setData({ error: err.errMsg });
        that.setData({ loading: false });
        setTimeout(function(){
          that.setData({ error: "" });
        },2000);
      }
    })


  }
})
