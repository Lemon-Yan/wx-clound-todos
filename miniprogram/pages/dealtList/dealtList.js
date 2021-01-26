// miniprogram/pages/dealtList/dealtList.js
let self;
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    todos: [],
    loading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    self = this;
    console.log(this.data.openid); 
     wx.showLoading({
       title: '加载中...',
     })
  },

  onGetOpenId() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log('openID:', res);
      app.globalData.openid = res.result.openid;
      this.getTodos();
    })
  },

  getTodos() {
    let db = wx.cloud.database();
    db.collection('todos').where({
      _openid: app.globalData.openid,
      date:this.data.currentDate
    }).orderBy('date', 'desc').orderBy('time', 'asc').get().then(res => {
      console.log('获取数据：', res);
      this.setData({
        todos: res.data,
        loading:true
      })
      wx.hideLoading();
    });
  },

  openAddBtn() {
    wx.navigateTo({
      url: '../dealtAdd/dealtAdd'
    })
  },
  todosDelete(e) {
    wx.showModal({
      title: '提示',
      content: '确定删除该待办吗？',
      confirmColor: '#1cbbb4',
      success(res) {
        if (res.confirm) {
          let db = wx.cloud.database(),
            id = e.currentTarget.dataset.id;
          console.log('删除id：', id)
          db.collection('todos').doc(id).remove().then(res => {
            console.log('删除待办：', res);
            wx.showToast({
              title: '删除成功',
            })
            self.getTodos();
          })
        }
      }
    })
  },
  todosEdite(e) {
    let id = e.currentTarget.dataset.id;
    console.log('编辑待办', id);
    wx.navigateTo({
      url: '../dealtAdd/dealtAdd?id=' + id
    })
  },
  todosComplete(e) {
    let done = e.currentTarget.dataset.done,
      id = e.currentTarget.dataset.id,
      db = wx.cloud.database();
    console.log('完成：', id)
    db.collection('todos').doc(id).update({
      data: {
        done: true
      }
    }).then(res => {
      console.log('更新待办', res);
      self.getTodos();
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let currentDate = getCurrentDate(); 
    this.setData({
      currentDate
    })
    this.onGetOpenId();
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getTodos();
    wx.stopPullDownRefresh() //刷新完成后停止下拉刷新动效
  },
  mydata(e) { //可获取日历点击事件
    let data = e.detail.data
    this.setData({
      currentDate: e.detail.data
    })
    this.getTodos();
    console.log(data)
  }, 
})

// 时间格式转换 yyyy－mm－dd
function getCurrentDate() {
  var date = new Date(); //获取系统当前时间
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()  
  return [year, month, day].map(formatNumber).join('-')
}

// 两位数自动补零
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}