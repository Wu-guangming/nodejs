//**在这里定义处理函数*/
//导入数据库操作模块
const db=require('../db/index')
//导入bcryptjs
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const config=require('../config')

//注册处理函数
exports.register=(req,res)=>{
  //获取客户端数据
  const userInfo=req.body
  //检测用户名和密码
  /* if(!userInfo.username||!userInfo.password){
    res.send({status:1,message:'用户名或密码不合法!'})
  } */
  //定义sql语句查询用户名是否被占用
  const sqlStr1='select* from ev_users where username=?'
  db.query(sqlStr1,userInfo.username,(err,results)=>{
    if(err){
      return res.send({status:1,message:err.message})
    }
    if(results.length!==0){
      return res.send({status:1,message:'用户名已存在'})
    }
    //密码加密,调用bcrypt.hashSync()
/*     console.log(userInfo.password)
    userInfo.password= bcrypt.hashSync(userInfo.password,10)
    console.log(userInfo.password) */

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

  })
  
}
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