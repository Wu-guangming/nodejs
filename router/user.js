const express=require('express')
const router=express.Router()

//导入用户处理函数模块
const userHandle=require('../router_handle/user')
//注册
router.post('/register',userHandle.register)
//登录
router.post('/login',userHandle.login)

module.exports=router