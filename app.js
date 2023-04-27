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

//解析token中间件
const  { expressjwt:jwt } =require('express-jwt')
const config=require('./config')
//path是排除不需要token验证的
app.use(jwt({secret:config.jwtSecretKey,algorithms: ['HS256'] }).unless({path:[/^\/api/]}))

//导入并使用用户路由模块
const userRouter=require('./router/user')
app.use('/api',userRouter)

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




//启动服务器
app.listen(3007,()=>{
  console.log('api sever is running at http://127.0.0.1:3007')
})