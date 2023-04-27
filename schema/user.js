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