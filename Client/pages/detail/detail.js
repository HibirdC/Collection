//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    showModalStatus: false,  //先设置隐藏
    imgUrls: [
      { id: 1, img: "../../images/1.png"},
      { id: 2, img: "../../images/3.png"},
      { id: 3, img: "../../images/4.png"},
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 4000,
    duration: 1000,
    circular: true,
    retData: [],
    showModal: false,
    xlh: 0,
    pwd: '',
    cplid: '',
    ppileid: 0,
    is_qing: 1,
    is_shou: '',
  },
  showDialogBtn: function () {
    wx.navigateTo({
      url: '../collection/collection',
    })
  },

  powerDrawer: function (e) {
    this.bindTaps();
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu);
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },

  onItemClick: function (event) {
    var id = event.target.dataset.postid;
    if(id ===1){
      wx.navigateTo({
        url: '../recycable/recycable',
      })
    }
    else if(id ===2){
      wx.showToast({
        title: id + "",
      })
    }
    else if (id === 3) {
      wx.showToast({
        title: id + "",
      })
    }
    else if (id === 4) {
      wx.showToast({
        title: id + "",
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
  }
})
