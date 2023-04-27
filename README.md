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

# 实现登录注册接口

## 准备数据库

首先创建数据库api_sever,然后新建表ev_users,属性如下

![image-20230425142212102](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\image-20230425142212102.png)

## 安装配置mysql模块

安装mysql模块

```
npm i mysql
```

在项目根目录中新建db/index.js文件,在此定义数据库连接对象

```
//导入db模块
const mysql=require('mysql')
//配置数据库连接对象
const db=mysql.createPool({
  host:'127.0.0.1',
  user:'root',
  password:'123456',
  database:'api_sever'
})
//向外共享
module.exports=db
```

## 实现注册

1. 检测表单数据是否合法
2. 检测用户名是否被占用
3. 对密码进行加密处理
4. 插入新用户

在user_handle中的user.js的注册处理函数模块

```
//获取客户端数据
  const userInfo=req.body
  //检测用户名和密码
  if(!userInfo.username||!userInfo.password){
    res.send({status:1,message:'用户名或密码不合法!'})
  }
```

检测用户名是否被占用

导入数据库操作模块

```
//导入数据库操作模块
const db=require('../db/index')
```

检测用户名是否被占用

```
//定义sql语句查询用户名是否被占用
  const sqlStr='select* from ev_users where username=?'
  db.query(sqlStr,userInfo.username,(err,results)=>{
    if(err){
      return res.send({status:1,message:err.message})
    }
    if(results.length!==0){
      return res.send({status:1,message:'用户名已存在'})
    }
    res.send('register OK')
  })
```

对密码加密处理(可不用,不方便对数据的调试)

使用bcryptjs,先npm下载

```
npm i bcryptjs
```

在user_handle/user.js中导入bcryptjs

```
//导入bcryptjs
const bcryptjs=require('bcryptjs')
```

```
//密码加密,调用bcrypt.hashSync()
    userInfo.password= bcrypt.hashSync(userInfo.password,10)
```

插入新用户

```
//插入新用户
    const sqlStr2='insert into ev_users set ?'
    db.query(sqlStr2,{username:userInfo.username,password:userInfo.password},(err,results)=>{
      if(err){
        return res.send({status:1,message:err.message})
      }
      if(results.affectedRows!==1){
        return res.send({status:1,message:'注册用户失败'})
      }
      res.send({status:0,message:'注册成功'})
    })
```

优化表单数据验证

依靠两个包

joi:定义验证规则

@escook/express-joi

```
npm i joi
npm i @escook/express-joi
```

新建schema/user.js定义用户验证规则

```
//导入验证规则的包joi
const joi=require('joi')



//定义用户名和密码验证规则
const username=joi.string().alphanum().min(1).max(10).required()
const password=joi.string().pattern(/^[\S]{1,10}$/).required()


//定义验证数据表单对象
exports.reg_login_schema={
  body:{
    username,
    password
  }
}
```

修改router/user.js代码,同时将router_handle/user.js中的验证部分注释掉

```
const express=require('express')
const router=express.Router()

//导入用户处理函数模块
const userHandle=require('../router_handle/user')
//导入验证数据的中间件
const expressJoi=require('@escook/express-joi')
//导入需要验证的数据对象
const {reg_login_schema}=require('../schema/user')




//注册
router.post('/register',expressJoi(reg_login_schema),userHandle.register)
//登录
router.post('/login',userHandle.login)

module.exports=router
```

在app.js中定义捕获错误的中间件

```
//导入express
const express=require('express')
//导入joi
const joi=require('joi')



//创建服务器实例对象
const app=express()
//导入并配置cors中间件
const cors=require('cors')
app.use(cors())
//配置解析表单数据的中间件
app.use(express.urlencoded({extended:false}))

//导入并使用用户路由模块
const userRouter=require('./router/user')
app.use('/api',userRouter)

//定义错误级别中间件
app.use((err,req,res,next)=>{
  //验证失败的错误
  if(err instanceof joi.ValidationError){
    res.send({status:1,message:err.message})
  }
  //未知错误
  res.send({status:1,message:err.message})
})




//启动服务器
app.listen(3007,()=>{
  console.log('api sever is running at http://127.0.0.1:3007')
})
```

可用postman验证

## 实现登录

检测表单数据是否合法

根据用户名查询用户数据

判断用户输入的密码是否正确

生成JWT的token字符串

在router/user.js中检测登录数据合法性,修改代码

```
//登录
router.post('/login',expressJoi(reg_login_schema),userHandle.login)
```

根据用户名查询用户数据,在登录处理函数模块router_handle/user.js

```
//登录处理函数
exports.login=(req,res)=>{
  const userInfo=req.body
  const sqlStr='select * from ev_users where username=?' 
  db.query(sqlStr,userInfo.username,(err,results)=>{
    if(err){
      return res.send({status:1,message:err.message})
    }
    if(results.length!==1){
      return res.send({status:1,message:'登陆失败'})
    }
    //判断密码是否正确,如果前面对密码加密了就可调用bcrypt.compareSync(用户提交,数据库中)
    //const compareResult= bcrypt.compareSync(userInfo.password,results[0].password)
    //如果没有就直接比较
    if(results[0].password!==userInfo.password){
      return res.send({status:1,message:'登陆失败,密码错误'})
    }
    res.send('login OK')
  })
 
}
```

登陆成功生成token

生成token时需要剔除密码

```
const user={...results[0],password:''}
```

安装生成token的包

```
npm i jsonwebtoken
```

新建config.js文件

```
//全局配置文件
module.exports={
  //加密和解密token的密钥
  jwtSecretKey:'hello world'
}
```

同时在处理函数模块引入

```
const JWT=require('jsonwebtoken')
const cconfig=require('../config')
```

登陆部分

```
//登录处理函数
exports.login=(req,res)=>{
  const userInfo=req.body
  const sqlStr='select * from ev_users where username=?' 
  db.query(sqlStr,userInfo.username,(err,results)=>{
    if(err){
      return res.send({status:1,message:err.message})
    }
    if(results.length!==1){
      return res.send({status:1,message:'登陆失败'})
    }
    //判断密码是否正确,如果前面对密码加密了就可调用bcrypt.compareSync(用户提交,数据库中)
    //const compareResult= bcrypt.compareSync(userInfo.password,results[0].password)
    //如果没有就直接比较
    if(results[0].password!==userInfo.password){
      return res.send({status:1,message:'登陆失败,密码错误'})
    }
    //生成token
    const user={...results[0],password:''}
    const tokenStr=jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn})
    res.send({status:0,message:'登录成功',token:'Bearer'+tokenStr})
  })
 
}
```

配置解析token中间件

安装express-jwt

```
npm i express-jwt
```

在app.js中,在路由之前导入

```
//解析token中间件
const  { expressjwt:jwt } =require('express-jwt')
const config=require('./config')
//path是排除不需要token验证的
app.use(jwt({secret:config.jwtSecretKey,algorithms: ['HS256'] }).unless({path:[/^\/api/]}))
```

在识别错误中间件

```
//定义错误级别中间件
app.use((err,req,res,next)=>{
  //验证失败的错误
  if(err instanceof joi.ValidationError){
    return res.send({status:1,message:err.message})
  }
  //身份认证失败后
  if(err.name!=='UnauthorizedError'){
    return res.send({status:1,message:'身份认证失败'})
  }
  //未知错误
  res.send({status:1,message:err.message})
})
```

