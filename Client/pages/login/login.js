import api from '../../utils/api'

Page({
  data: {
    loading: false,
    loginStatus: false,
    userName: "",
    mobile: "",
    companyId:"",
    error: "",
    buttonName:"绑定账号",
    inputNameTxt:"",
    inputMobileTxt: "",
    inputCompanyIdTxt: ""
  },

  onLoad: function() {
    var CuserInfo = wx.getStorageSync('CuserInfo');
    if (CuserInfo.token) {
      this.setData({ userName: CuserInfo.userName });
      this.setData({ mobile: CuserInfo.mobile });
      this.setData({ companyId: CuserInfo.companyId });
      this.setData({ inputNameTxt: CuserInfo.userName});
      this.setData({ inputMobileTxt: CuserInfo.mobile });
      this.setData({ inputCompanyIdTxt: CuserInfo.companyId });
      this.setData({ companyName: CuserInfo.companyName });
      this.setData({ companyAddr: CuserInfo.companyAddr });
      this.setData({ buttonName: "解绑账号" });
    }
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

    if (userName === "") return;
    if (mobile === "") return;
    if (companyId === "") return;

    //初始化error
    that.setData({ error: "" });
    that.setData({ companyName: "" });
    that.setData({ companyAddr: "" });

    if (that.data.loginStatus) {
      wx.clearStorageSync();
      that.setData({ loginStatus: false });
      that.setData({ buttonName: "绑定账号" });
      that.setData({ inputNameTxt: "" });
      that.setData({ inputMobileTxt: "" });
      that.setData({ inputCompanyIdTxt: "" });
      return;
    }

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
            companyId: companyId,
            token: res.data.token,
            companyAddr: res.data.companyAddr,
            companyName: res.data.companyName
          };
          console.log(CuserInfo)
          wx.setStorageSync('CuserInfo', CuserInfo);

          that.setData({ loading: false });
          that.setData({ loginStatus: true });
          that.setData({ companyName: CuserInfo.companyName });
          that.setData({ companyAddr: CuserInfo.companyAddr });

        }else{
          that.setData({ error: res.code + ":" + res.message});
          that.setData({ loading: false });
        }
      }else{
        that.setData({ loading: false });
        that.setData({ error: err.errMsg });
        setTimeout(function(){
          that.setData({ error: "" });
        },2000);
      }
    })
  }
})
