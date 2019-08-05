var express = require('express')

var bodyParser = require('body-parser')

var session = require('express-session')//引包

var path = require('path')

var app = express()

var router = require('./router')

//配置解析表单post请求体插件
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

//配置express-session插件，可以通过req.session来访问和设置session成员了
app.use(session({
	secret : 'keyboard cat',
	resave : false,
	saveUninitialized : true
}))

app.use('/public',express.static(path.join(__dirname,'./public/')))
app.use('/node_modules',express.static(path.join(__dirname,'./node_modules')))

app.engine('html',require('express-art-template'))

app.use(router)

app.listen(80,function(){
	console.log('running...')
})