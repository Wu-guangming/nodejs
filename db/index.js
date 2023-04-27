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