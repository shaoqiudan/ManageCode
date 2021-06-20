let currentPage = 0 // 当前第几页,0代表第一页 
let pageSize = 10 //每页显示多少数据 
Page({
  data: {
    dataList: [], //放置返回数据的数组  
    edataList: [], 
    deldataList: [], 
    tempFilePaths:"http://h.hiphotos.baidu.com/zhidao/pic/item/6d81800a19d8bc3ed69473cb848ba61ea8d34516.jpg",
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false ,//“没有数据”的变量，默认false，隐藏  
    hiddenmodalput: true,
    text: "",
    id:""
  },
  onLoad() {
  },
  onShow() {
    currentPage = 0
    this.datalist=[]
    this.getData()
  },
  expInput: function (e) {
    this.setData({ text: e.detail.value })
    console.log( e.detail.value)
  },
  confirm: function(event) {
    let that = this;
    const db = wx.cloud.database();
    console.log(event); // 将其打印可以自己看看
    db.collection('recognizegarbagelist').where({
      tempfilepaths: this.data.id
    }).update({
      data: {
        kind: this.data.text
      }
    })

    var team_image = wx.getFileSystemManager().readFileSync(this.data.id, "base64")
    wx.request({
      url: 'http://127.0.0.1:5000/save', //API地址
      　　　　　 　　　　　method: "POST",
      header: {
        　　　　　　　　　'content-type': "application/x-www-form-urlencoded",
        　　　　　　　　},
      data: {image: team_image,
      name:this.data.text},
   })  

    this.setData({
      hiddenmodalput: !this.data.hiddenmodalput})   
      wx.cloud.database().collection("recognizegarbagelist")
            .get({
              success(res) {
                if (res.data && res.data.length > 0) {
                  console.log("请求成功：", res.data)
                  //把新请求到的数据添加到dataList里       
                  console.log(res.data)        
                  let list = that.data.edataList.concat(res.data)
                  console.log("list:")
                  console.log(list)
                  that.setData({
                    dataList: list, //获取数据数组    
                  });
      }
      }
      })
      // this.setData({
    //   hiddenmodalput: !this.data.hiddenmodalput})  
    
    



},
deleteitem: function(e) {
  let index2 = e.currentTarget.dataset.id
  this.setData({
    id:index2,
  })
  const db = wx.cloud.database();
  db.collection('recognizegarbagelist').where({
    tempfilepaths: this.data.id
  }).remove({ })
  let that=this
  wx.cloud.database().collection("recognizegarbagelist")
      .get({
        success(res) {
          if (res.data && res.data.length > 0) {
            console.log("删除请求", res.data)
           
            //把新请求到的数据添加到dataList里  
            
            let list = that.data.deldataList.concat(res.data)
            console.log(list)
            that.setData({
              dataList: list, //获取数据数组    
            });
}
}
})
},
  modalinput: function (e) {
    let index = e.currentTarget.dataset.id
    console.log(index)
    this.setData({
      //注意到模态框的取消按钮也是绑定的这个函数，
      //所以这里直接取反hiddenmodalput，也是没有毛病
      id:index,
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  //页面显示的事件
 
  //页面上拉触底事件的处理函数
  onReachBottom: function() {
    console.log("上拉触底事件")
    let that = this
    if (!that.data.loadMore) {
      that.setData({
        loadMore: true, //加载中  
        loadAll: false //是否加载完所有数据
      });
      //加载更多，这里做下延时加载
      setTimeout(function() {
        that.getData()
      }, 2000)
    }
  },
  //访问网络,请求数据  
  getData() {
    let that = this;
    //第一次加载数据
    if (currentPage == 1) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      })
    }
    //云数据的请求
    wx.cloud.database().collection("recognizegarbagelist")
      .skip(currentPage * pageSize) //从第几个数据开始
      .limit(pageSize)
      .get({
        success(res) {
          if (res.data && res.data.length > 0) {
            console.log("请求成功", res.data)
            currentPage++
            //把新请求到的数据添加到dataList里  
            console.log(currentPage)
            // list=res.data
            that.data.dataList=[]
            let list = that.data.dataList.concat(res.data)
            // this.tempFilePaths=res.data[0].tempFilePaths
            console.log(res.data)
            console.log(list)
            that.setData({
              dataList: list, //获取数据数组    
              // datalist:res.data,
              loadMore: false ,//把"上拉加载"的变量设为false，显示  
              tempFilePaths:"http://tmp/u23aCku0oAQk82d10bc55e2ea39d9c2b4702a09bddc4.jpg"
            });

            if (res.data.length < pageSize) {
              that.setData({
                loadMore: false, //隐藏加载中。。
                loadAll: true //所有数据都加载完了
              });
            }
          } else {
            that.setData({
              loadAll: true, //把“没有数据”设为true，显示  
              loadMore: false //把"上拉加载"的变量设为false，隐藏  
            });
          }
        },
        
      })
  },
})