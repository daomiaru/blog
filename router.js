var express = require('express')

var User = require('./models/user')

var person = require('./save')

var md5 = require('blueimp-md5')
//创建一个路由容器
var router = express.Router()

//将get请求挂载到路由容器中
//渲染首页



router.get('/',function(req,res){
	person.findall(function(err,data){
		if(err){
			console.log('aa')
		}
		 
		// console.log(data)
		console.log(req.session.user)
		res.render('index.html',{
		comments : data,
		user : req.session.user
		})
	})	
})

router.get('/speak',function(req,res){
	res.render('speak.html',{
		user : req.session.user
	})
})

router.post('/save',function(req,res){
	var body = req.body
	req.session.user = body
	res.redirect('/')
})

//渲染设置页面
router.get('/settings/admin',function(req,res){
	console.log(req.session.user)
	res.render('settings/admin.html')
})

//渲染个人主页页面
router.get('/settings/profile',function(req,res){
	// console.log(req.session.user)
	console.log(req.session.user)
	res.render('settings/profile.html',{
		user : req.session.user
	})
})

//渲染注册页面
router.get('/register',function(req,res){
	res.render('register.html')
})

//处理注册请求
router.post('/register', function (req, res) {
  
  User.findOne({//先查询是否有相同邮箱条件的账户存在
        email: req.body.email
  	}, function (err, data) {
    if (err) {
      	return res.status(500).json({//若错误，则服务器返回错误状态码500
        err_code: 500,
        message: 'Server error'
      })
    }
    if (data) {
      	return res.status(200).json({//若果有数据，说明邮箱重复。注册不成功，但是这里不是服务端的错误，为了与成功的情况作区分，所以这里与客户端约定以状态码1来表明邮箱重复。
        err_code: 1,
        message: 'The email aleady exists!'
      })
    }
    User.findOne({//再查询昵称是否重复
    	nickname : req.body.nickname
    },function(err,data){
    	if(err){
    	return res.status(500).json({//若错误，则服务器返回错误状态码500
        err_code: 500,
        message: 'Server error'
      })
    }if(data){
    	return res.status(200).json({//若有数据，说明昵称重复，返回状态码1.json()是express提供的响应方法，他可以将一个json对象转换成字符床发送给客户端
        err_code: 2,
        message: 'The Nickname aleady exists!'
      })
    }  
        //对密码进行 md5 重复加密
    req.body.password = md5(md5(req.body.password))

    new User({
    	email : req.body.email,
    	nickname : req.body.nickname,
    	password : req.body.password
    }).save(function (err, user) {
      if (err) {
        return res.status(500).json({
          err_code: 500,
          message: 'Server error.'
        })
      }

      req.session.user = user//注册成功将user信息保存到session中，session储存用户数据，默认session数据是内存存储的，服务器一旦重启，session数据就丢失了

      res.status(200).json({
        err_code: 0,//0表示注册成功
        message: 'OK'
      })
    })
    })
  })
})


router.get('/logout',function(req,res){
	//清除登录信息
	//重定向到登录页
	req.session.user = null
	res.redirect('/login')
})


//渲染登录页面
router.get('/login',function(req,res){
	res.render('login.html')
})

//处理登录请求
router.post('/login',function(req,res){
	var body = req.body
	// req.body.password = md5(md5(req.body.password))
	User.findOne({
		email : body.email,
		password : md5(md5(body.password))
	},function(err,ret){
		if(err){
			return res.status(500).json({
				err_code :500,
				message : 'Server error'
			})
		}
		if(!ret){
			return res.status(200).json({
				err_code : 1,
				message : 'not find!'
			})
		}
		if(ret){
		req.session.user = ret
		return res.status(200).json({
			err_code : 0,
			meassage : 'login ok'
		})

		}
		
	})
})

//渲染登录推出页面
router.get('/loginout',function(req,res){
	res.render('index.html')
})

//渲染提交评论后的页面
router.post('/pinlun',function(req,res){
	// var user = req.session.user
	// var comment = req.body
	// var date = new Date()
	// comment.data = date
	// comment.nickname = user.nickname
	// console.log(comment)
	// comments.unshift(comment)
	// res.redirect('/')
	Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
	
	var date = new Date().Format("yyyy-MM-dd HH:mm:ss")
	req.body.data = date
	req.body.nickname = req.session.user.nickname
	console.log(req.body)
	person.add(req.body,function(err){
		if(err){
			console.log('error')
		}res.redirect('/')
	})
})

//导出路由对象
module.exports = router