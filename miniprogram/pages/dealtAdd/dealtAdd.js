Page({

  /**
   * 页面的初始数据
   */
  data: {
    dealtType: ['工作', '会议', '商务', '出行','学习','跑步','生日'],
    date: '2021-01-21',
    time: '12:01',
    dealTypeTxt: '工作',
    title: '',
    address: '',
    remarks: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('todoAdd:', options.id)
    let id = options.id,
    cDate=dateFormater('YYYY-MM-DD');
    this.setData({
      todoId:id,
      date:cDate
    })
    if (id) {
      wx.setNavigationBarTitle({
        title: '编辑待办'
      }) 
      this.getTodo();
    } 
  },

  getTodo() {
    let db = wx.cloud.database();
    db.collection('todos').doc(this.data.todoId).get().then(res => {
      console.log('编辑待办数据：', res.data);
      let {
        dealtType,
        date,
        time,
        title,
        address,
        remarks
      } = res.data;
      this.setData({
        date,
        time,
        dealTypeTxt: dealtType,
        title,
        address,
        remarks
      })
    })
  },

  bindPickerChange: function (e) {
    console.log('类型：', e.detail.value)
    this.setData({
      dealTypeTxt: this.data.dealtType[e.detail.value]
    })
  },
  bindDateChange: function (e) {
    console.log('日期：', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    console.log('时间：', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  },
  titleInput(e) {
    let inputVal = e.detail.value;
    this.setData({
      title: inputVal
    })
  },
  addressInput(e) {
    let inputVal = e.detail.value;
    this.setData({
      address: inputVal
    })
  },
  remarksInput(e) {
    let inputVal = e.detail.value;
    this.setData({
      remarks: inputVal
    })
  },
  confirmBtn() {
    let data = {
        dealtType: this.data.dealTypeTxt,
        title: this.data.title,
        date: this.data.date,
        time: this.data.time,
        address: this.data.address,
        remarks: this.data.remarks,
        done: false
      },
      db = wx.cloud.database(),
      todoId = this.data.todoId;
    console.log(data)
    if (todoId) {
      db.collection('todos').doc(todoId).update({
        data
      }).then(res => {
        wx.showToast({
          title: '编辑成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000);
      })
    } else {
      db.collection('todos').add({
        data: data
      }).then(res => {
        console.log('创建待办：', res);
        wx.showToast({
          title: '创建成功',
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 1000);
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
})
//格式化日期或获取当前日期
function dateFormater(formater, t) {
  let date = t ? new Date(t) : new Date(),
    Y = date.getFullYear() + '',
    M = date.getMonth() + 1,
    D = date.getDate(),
    H = date.getHours(),
    m = date.getMinutes(),
    s = date.getSeconds();
  return formater.replace(/YYYY|yyyy/g, Y)
    .replace(/YY|yy/g, Y.substr(2, 2))
    .replace(/MM/g, (M < 10 ? '0' : '') + M)
    .replace(/DD/g, (D < 10 ? '0' : '') + D)
    .replace(/HH|hh/g, (H < 10 ? '0' : '') + H)
    .replace(/mm/g, (m < 10 ? '0' : '') + m)
    .replace(/ss/g, (s < 10 ? '0' : '') + s)
}