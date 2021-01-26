### 查询指令之比较和逻辑操作符
- gt 大于
- lt 小于
- eq 等于
- neq 不等于
- lte 小于或等于
- gte 大于或等于
- in 在数组中 
- nin 不在数组中
- and 条件与
- or 条件或
- not 条件非
- nor 都不

示例：查询广东省内、GDP 在 3000 亿以上且在 1 万亿以下的城市。
```
.where({
    province:_.eq("广东"),
    gdp:_.gt(3000).and(_.lt(10000))
  })
```
### 构建查询条件的5个方法
- Collection.where() 查询的条件指令
- Collection.field() 显示哪些字段
- Collection.orderBy() 排序方式， orderBy('字段名', '排序方式')  desc 降序、asc 升序
- Collection.skip() 跳过多少条记录（常用于分页），0不跳过；每页20个：skip((n-1)*20)
- Collection.limit() 限制显示多少条记录（最大数量：小程序端20，服务端100）

示例：
```
const db = wx.cloud.database()  //获取数据库的引用
const _ = db.command     //获取数据库查询及更新指令
db.collection("china")  //获取集合china的引用
  .where({              //查询的条件指令where
    gdp: _.gt(3000)     //查询筛选条件，gt表示字段需大于指定值。
  })
  .field({             //显示哪些字段
    _id:false,         //默认显示_id，这个隐藏
    city: true,
    province: true,
    gdp:true
  })
  .orderBy('gdp', 'desc')  //排序方式，降序排列
  .skip(0)                 //跳过多少个记录（常用于分页），0表示这里不跳过
  .limit(10)               //限制显示多少条记录，这里为10

  .get()                   //获取根据查询条件筛选后的集合数据
  .then(res => {
    console.log(res.data)
  })
  .catch(err => {
    console.error(err)
  })
大家可以留意一下数据查询的链式写法， wx.cloud.database().collection('数据库名').where().get().then().catch()，前半部分是数据查询时对对象的引用和方法的调用；后半部分是Promise对象的方法，Promise对象是get的返回值。写的时候为了让结构更加清晰，我们做了换行处理，写在同一行也是可以的。
```

### 正则匹配
options参数：options 支持 i, m, s 这三个 flag。
- i 大小写不敏感
- m 跨行匹配
- s 让`.`可以匹配包括换行符在内的所有字符
示例：
```
// 数据库正则对象
db.collection('todos').where({
  description: db.RegExp({
    regexp: 'miniprogram',
    options: 'i',
  })
})
```

### 数据库常用操作
#### Collection.add() 新增记录
```
db.collection('todos').add({
        data:{
        description:'待办测试',
         due:'2021-01-20',
         tags:['clound','database'],
         style:{
           color:'red'
         },
         done:false
       },
}).then(res=>{
  console.log(res)
}).catch(console.err)
```
#### Collection.get() 查询记录
```
//查询多条记录
db.collection('todos').where({
  'style.color':'red'
}).get()
//查询单条记录
db.collection('todos').doc('28ee4e3e600699ab001af1fc07ccd456').get().then(res=>{
    console.log('获取数据：',res.data);
})
```
### Collection.remove() 删除记录
仅可删除创建者创建的数据
```
 db.collection('todos').doc('79550af26006a5df001966cd11ad4763').remove().then(res=>{
      console.log(res);
    });
```
### Collection.update() 更新记录
仅可修改创建者创建的数据
```
    db.collection('todos').doc('1526e12a6006a1e100148dbc1cf7bb7a').update({
      data:{
        'done':false,
        'style.color':'red'
      }
    }).then(res=>{
      console.log(res);
    }); 
```

#### Collection.count() 统计记录
小程序端：仅能统计有读权限的记录数；
管理端：可以统计集合的所有记录数。
* 注意：与集合权限设置有关 
field、orderBy、skip、limit 对 count 是无效的，只有 where 才会影响 count 的结果，count 只会返回记录数，不会返回查询到的数据。
示例：
```
const db = wx.cloud.database()
const _ = db.command
db.collection("china")
  .where({
    gdp: _.gt(3000)
  })
  .count().then(res => {
    console.log(res.total)
  })
```

### 云函数操作数据库
* 注意:` cloud.database() wx.cloud.database()`云函数端的数据库引用和小程序端有所不同
新建一个云函数todosdata，然后输入以下代码：
```
// 云函数入口函数
exports.main = async (event, context) => {
   const db=cloud.database();
   const _=db.command;

  return await db.collection('todos').where({
    'done':false
  }).get();
}
```
然后右键todosdata云函数根目录选择在终端打开，输入npm install，之后“上传并部署所有文件”。

小程序调用云函数：
```
 todosBtn(){
    wx.cloud.callFunction({
      name:'todosdata' 
    }).then(res=>{
      console.log('todos云函数：',res.result.data);
    })
  }
```
在控制台可以查看到查询结果。

