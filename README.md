# nodejs
创建nodejs模拟后端提供接口的模板

以用户登录,注册接口为例

# 初始化

## 新建项目

新建文件夹api_sever(不能有中文)作为项目根目录,然后在vscode中在该项目下打开终端,执行如下命令,初始化包管理配置文件

```
npm init -y
```

安装express

```
npm i express --save
如果要安装特定版本则
npm i express@版本号
```

在项目根目录下新建app.js文件作为整个项目的入口文件,初始化如下代码

```
//导入express
const express=require('express')
//创建服务器实例对象
const app=express()

//write your code here......


//调用app.listen方法,并指定端口号3007,启动web服务器
app.listen(3007,()=>{
  console.log('api sever is running at http://127.0.0.1:3007')
})
```

## 配置cors

安装cors

```
npm i cors
```

导入和配置cors

```
//导入并配置cors中间件
const cors=require('cors')
//将cors注册为全局中间件
app.use(cors())
```

配置解析表单数据application/x-www-form-urlencoded(此中间件只能解析这种)的中间件

```
//配置解析表单数据的中间件
app.use(express.urlencoded({extended:false}))
```

## 初始化路由相关的文件夹

在项目根目录中新建router文件夹,存放所有的**路由模块**(只存放客户端请求与处理函数之间的映射关系)

在项目根目录中新建router_handle,存放所有的**路由处理函数模块**(每个路由对应的处理函数)

## 初始化用户路由模块

在router文件夹新建user.js文件,作为用户的路由模块

```
const express=require('express')
//创建路由对象
const router=express.Router()

//注册
router.post('/register',(req,res)=>{
  res.send('register OK')
})
//登录
router.post('/login',(req,res)=>{
  res.send('login OK')
})
//将路由对象共享出去
module.exports=router
```

在app.js中导入并使用

```
//导入并使用用户路由模块
const userRouter=require('./router/user')
app.use('/api',userRouter)

```

此时可以用postman验证该接口

先在vscode终端启动

```
nodemon .\app.js
```

然后在postman中验证接口

http://127.0.0.1:3007/api/login

http://127.0.0.1:3007/api/login

## 抽离用户路由模块的处理函数

在router_handle/user.js中,使用exports向外共享处理函数

```
//**在这里定义处理函数*/

//注册处理函数
exports.register=(req,res)=>{
  res.send('register OK')
}
//登录处理函数
exports.login=(req,res)=>{
  res.send('login OK')
}
```

将router/user.js代码修改如下

```
const express=require('express')
//创建路由对象
const router=express.Router()

//导入用户处理函数模块
const userHandle=require('../router_handle/user')
//注册
router.post('/register',userHandle.register)
//登录
router.post('/login',userHandle.login)
//将路由对象共享出去
module.exports=router
```

此处可再次用postman验证
