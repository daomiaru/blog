var mongoose = require('mongoose')

var Schem = mongoose.Schema

mongoose.connect('mongodb://localhost/user')
//设计表结构
var userSchema = new Schem({
	email :{//邮箱，必须有
		type : String,
		require : true
	},
	nickname :{//昵称，必须有
		type :String,
		require :true
	},
	password :{//密码，必须有
		type : String,
		require : true
	},
	avatar :{//头像，默认
		type : String,
		default : '/public/img/avatar-max-img.png'
	},
	bio :{//介绍，默认为空
		type :String,
		default : ''
	},
	gender :{//性别，默认保密
		type :Number,
		enum: [-1,0,1],
		default: -1
	},
	birthday :{//生日
		type :Date,
	},
	status :{//状态，0无限制，1不可以评论，2不可以登陆
		type :Number,
		default: 0
	}
})


module.exports = mongoose.model('User',userSchema)