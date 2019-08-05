## 1.前期准备工作

### path路径操作模块

- path.bashname :获取一个文件的路径名，默认包含扩展名

- path.dirname:获取一个路径中的目录部分

- path.extname:获取一个路径中的扩展名部分

- path.parse：把一个路径转为对象

  root:根目录

  dir:目录

  base:包含后缀名的文件名

  ext:后缀名

  name:不包含后缀名的文件名

- path.join:拼接路径

- path.isAbsolute:判断一个路径是否为绝对路径

__dirname:动态获取当前文件所处目录的绝对路径

__filename:动态获取当前文件的绝对路径



### 读取文件路径问题

node在读文件操作时，redaFile()中的文件path路径其实是相对于运行终端的路径，而不是相对于加载它的js文件的路径。若所处的执行文件与读取文件不在同一级那么读取就会报错

我们先来看第一种情况

![1564453275779](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453275779.png)

![1564453309856](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453309856.png)

此时若我们把index.js文件放到上一级目录中，我们会发现

![1564453534897](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453534897.png)

解决方法就是将readFile中的相对路劲改为

![1564453671120](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453671120.png)

![1564453682616](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453682616.png)

但若我们每次加载该文件都要修改readFile中的路径的话就会很麻烦，所以最好的方法是采用绝对路径，此时我们无论在什么位置读取该文件都无需修改了

![1564453798066](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453798066.png)

![1564453830761](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564453830761.png)

但是在实际的业务项目中，若我们把自己的项目发给客户的话，不可能让客户去兼容我们电脑的路径。因此

我们需要动态的获取文件的绝对路径。这样无论是在什么机器上读取都不会有错也无需修改读取路径了。

![1564454611649](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564454611649.png)

此时就算换了一台电脑，只要该文件存在我们也可以动态的获取文件路径并读取。但是为了防止我们敲代码的时候写错路径，开发人员给我们提供了一种方法path.join()可以自动帮我们拼接路径防止出错

![1564454763722](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564454763722.png)

### art-template中的继承语法

子模版

header.html

```javascript
<div><h1>公共的头部</h1></div>
```

子模版

footer.html

```javascript
<div><h1>公共的尾部</h1></div>
```



1.首先定义一个layout.html模板页

```javascript
<!-- 该页面为模板页，可以继承使用 -->

<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<link rel="stylesheet" href="/node_modules/bootstrap/dist/css/bootstrap.css">
	{{  block 'head' }}{{ /block }}
</head>
<body>
	{{ include './header.html' }}

	 	{{ block 'content' }}
    	<h1>默认内容</h1>
  		{{ /block }}

	{{ include './footer.html' }}
	<script src="node_modules/jquery/dist/jquery.js"></script>
	<script src="node_modules/bootstrap/dist/js/bootstrap.js"></script>
	{{  block 'script' }}{{ /block }}
</body>
</html>
```

2.新建一个index.html继承该页面获得它的公共样式

```javascript
{{extend './layout.html'}}

{{  block 'head' }}
<style>

body{
	background:skyblue;
}

</style>

{{ /block }}


{{ block 'content' }}
<h1>自己的内容</h1>
{{ /block }}

```

![1564471566075](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564471566075.png)



## 2.路由设计

| 路径      | 方法 | get参数 | post参数                        | 是否需要登陆 | 备注         |
| --------- | ---- | ------- | ------------------------------- | ------------ | ------------ |
| /         | GET  |         |                                 |              | 渲染首页     |
| /register | GET  |         |                                 |              | 渲染注册页面 |
| /register | POST |         | email、nickname(昵称)、password |              | 处理注册请求 |
| /login    | GET  |         |                                 |              | 渲染登陆页面 |
| /login    | POST |         | email、password                 |              | 处理登陆请求 |
| /loginout | GET  |         |                                 |              | 处理退出请求 |

### 

## 3.处理注册请求

```javascript
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
      res.status(200).json({
        err_code: 0,//0表示注册成功
        message: 'OK'
      })
    })
    })
  })
})

```

#### 关于表单同步提交或异步提交的问题

#### 同步提交：

表单默认同步提交，表单同步提交之后，浏览器会‘锁死’，也就是我们常说的刷新，等待服务器的响应结果。表单的同步提交之后无论服务端响应的是什么，都会直接把响应的结果覆盖到当前的页面，若想实现想ajax那样的无刷新效果**（其实也不是真正意义上的无刷新，只是会保留客户原始输入的数据，并且给出提示）**。可以采用art-template服务端渲染页面再发送给客户端的方式

```javascript
<form id="register_form" method="post" action="/register">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="Email" autofocus>
      </div>
      <div class="form-group">
        <label for="nickname">昵称</label>
        <input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
      </div>
      <button type="submit" class="btn btn-success btn-block">注册</button>
    </form>

```

这里用服务器渲染后发送给客户端解析

```javascript
router.post('/register', function (req, res) {
	var body = req.body
  User.findOne({//先查询是否有相同邮箱条件的账户存在
        email: body.email
  	}, function (err, data) {
    if (err) {
      	return res.status(500).json({//若错误，则服务器返回错误状态码500
        err_code: 500,
        message: 'Server error'
      })
    }
    if (data) {
      return res.render('register.html',{
     	message : '邮箱已存在',
     	from : body
     	// email : req.body.email,
     	// nickname : req.body.nickname

     })
    }
 User.findOne({//再查询昵称是否重复
    	nickname : body.nickname
    },function(err,data){
    	if(err){
    	return res.status(500).json({//若错误，则服务器返回错误状态码500
        err_code: 500,
        message: 'Server error'
      })
    }if(data){
    	// return res.status(200).json({//若有数据，说明昵称重复，返回状态码1.json()是express提供的响应方法，他可以将一个json对象转换成字符床发送给客户端
     //    err_code: 2,
     //    message: 'The Nickname aleady exists!'
     //  })
  		return res.render('register.html',{
     	message : '昵称已存在',
     	// email : req.body.email,
     	// nickname : req.body.nickname
     	from : body
     })
    }  
        //对密码进行 md5 重复加密
    req.body.password = md5(md5(req.body.password))

    new User({
    	email : body.email,
    	nickname : body.nickname,
    	password : body.password
    }).save(function (err, user) {
      if (err) {
        return res.status(500).json({
          err_code: 500,
          message: 'Server error.'
        })
      }
   	return	res.render('register.html',{
     	message : '注册成功',
     	// email : req.body.email,
     	// nickname : req.body.nickname
     	from : body
     })
      })
    })
    })
  })
```



```javascript
<div class="main">
    <div class="header">
      <a href="/">
        <img src="/public/img/logo3.png" alt="">
      </a>
      <p id="ppd">{{ message }}</p>
      <h1>用户注册</h1>
    </div>
    <!-- 
      表单具有默认的提交行为，默认是同步的，同步表单提交，浏览器会锁死（转圈儿）等待服务端的响应结果。
      表单的同步提交之后，无论服务端响应的是什么，都会直接把响应的结果覆盖掉当前页面。
     -->
    <form id="register_form" method="post" action="/register">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="Email" value="{{ from && from.email }}" autofocus>
      </div>
      <div class="form-group">
        <label for="nickname">昵称</label>
        <input type="text" class="form-control" id="nickname" name="nickname" value="{{from && from.nickname}}" placeholder="Nickname">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
      </div>
      <button type="submit" class="btn btn-success btn-block">注册</button>
    </form>
    <div class="message">
      <p>已有账号? <a href="/login">点击登录</a>.</p>
    </div>
  </div>
```

![1564542466810](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564542466810.png)



#### 表单异步提交：

表单异步ajax提交,客户端无刷新，并可以根据服务端发送回来的信息做dom处理，更便于操作。良好的交互方式。

表单异步ajax提交,去掉from标签中的method属性，以及action属性，这里 e.preventDefault()阻止默认提交方式,

```javascript
<form id="register_form">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="Email" autofocus>
      </div>
      <div class="form-group">
        <label for="nickname">昵称</label>
        <input type="text" class="form-control" id="nickname" name="nickname" placeholder="Nickname">
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
      </div>
      <button type="submit" class="btn btn-success btn-block">注册</button>
    </form>  


<script>
    $('#register_form').on('submit', function (e) {
      e.preventDefault()//阻止表单默认提交方式,默认为同步提交
      var formData = $(this).serialize()//序列化表单提交信息为字符串
      $.ajax({//客户端发送ajax请求要求返回数据类型为json
        url: '/register',
        type: 'post',//指定提交方式
        data: formData,
        dataType: 'json',
        success: function (data) {
          console.log(data)
          var err_code = data.err_code
          if(err_code === 0){
            window.alert('注册成功！')
            window.location.href = '/'//成功则表单重定向到主页
          }else if(err_code === 1){
            window.alert('邮箱已存在，请重新注册')
          }else if(err_code === 2){
            window.alert('昵称已存在，请重新注册')
          }else if(err_code === 500){
            window.alert('服务器繁忙，请稍后重试！')
          }
        }
      })
    })
  </script>
```

顺便一提，服务端重定向对异步请求无效，若想异步请求重定向，只能由客户端来指定

```javascript
 window.location.href = '/'//成功则表单重定向到主页
```



### 4.使用express-session插件来保存用户登陆状态信息

当我们登陆一个网页时，服务器会给我们发送一个唯一的标识，那就是cookie,我们可以通过这个唯一的cookie来拿到对应的session数据。若cookie没了，那么数据也就拿不到了，我们就相当于退出了，这时候如果想要再获取数据，只能再重新登陆一次，服务端会在给我们一个cookie.我们凭借这个cookie去那我们的数据

1.先下载express-session插件

```shell
npm i express-session
```

2.配置插件

```javascript
var session = require('express-session')//引包

//配置express-session插件，可以通过req.session来访问和设置session成员了
app.use(session({
	secret : 'keyboard cat',
	resave : false,
	saveUninitialized : true
}))
```

若注册成功,则将用户信息保存在req.session.user中，这样可以根据是否有user数据来判断用户的登陆状态了

默认session数据是内存存储的，服务器一旦重启，session数据就丢失了

![1564558690649](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558690649.png)

注册成功，则跳转主页

![1564558863464](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558863464.png)

![1564558749765](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558749765.png)

这时候根据session来渲染客户端看到的页面

![1564558793813](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558793813.png)

若有user

![1564558884647](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558884647.png)

没有user

![1564558914213](C:\Users\14331\AppData\Roaming\Typora\typora-user-images\1564558914213.png)