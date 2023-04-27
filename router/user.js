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
router.post('/login',expressJoi(reg_login_schema),userHandle.login)

module.exports=router