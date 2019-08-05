var fs = require('fs')

var path = './views/db.json'

exports.findall = function(callback){
	fs.readFile(path,'utf8',function(err,data){//因为读文件操作是异步的，不可能等到文件读取完之后在调用findall.所以这里使用回调函数callback获取异步操作的结果
		if(err){
		return	callback(err)
		}
		callback(null,JSON.parse(data).users)
	})
}

exports.add = function(user,callback){
  fs.readFile(path,'utf8',function(err,data){
  	if(err){
  	return callback(err)//读取文件错误则返回err
  }
   var users = JSON.parse(data).users//读取成功先获取user对象

  users.push(user)//将res.body放进students数组中

  var fileData = JSON.stringify({ users : users })//把对象数据转换成字符串

    fs.writeFile(path,fileData,function(err){//写入文件
  	if(err){
  		return callback(err)//失败返回错误对象
  	}
  	  callback(null)//成功错误对象为空
  })
  })
}