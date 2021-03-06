// api服务
const Restify = require('restify');
const Server = Restify.createServer();
Server.use(Restify.plugins.queryParser());
Server.use(Restify.plugins.bodyParser());

// mongo数据库
const Mongo = require('mongojs');
const comDb = Mongo('collection', ['company']);
const company = comDb.collection('company');

const userDb = Mongo('collection', ['user']);
const users = userDb.collection('user');


// request
const Request = require('request');

// 小程序解密库
const WXBizDataCrypt = require('./WXBizDataCrypt');

// redis
const Redis = require('redis');
const RedisClient = Redis.createClient();

// uuid
const uuid = require('uuid');



// 监听端口号
const PORT = 5301;

// 小程序参数
const APP_ID = 'wxf56f3b8dbca9bfee';
const APP_SECRET = 'cea80124d59f736b9e4f702609d976cd';

/********** 业务处理开始 **********/

// 获取解密SessionKey
const getSessionKey = (code, callback) => {
	const url = 'https://api.weixin.qq.com/sns/jscode2session?appid='
	+APP_ID+'&secret='+APP_SECRET+'&js_code='+code
	+'&grant_type=authorization_code';
	Request(url, (error, response, body) => {
		if(!error && response.statusCode == 200){
			console.log('getSessionKey:', body, typeof(body));

			const data =JSON.parse(body);
			if(!data.session_key){
				callback({
					code: 1,
					message: data.errmsg
				});
				return
			}
			callback(null, data)
		}else{
			callback({
				code: 1, 
				message: error
			})
		}
	})
};

// 解密
const decrypt = (sessionKey, encryptedData, iv, callback) => {
	try{
		const pc = new WXBizDataCrypt(APP_ID, sessionKey);
		const data = pc.decryptData(encryptedData , iv);
		console.log('decrypted:', data);
		callback(null, data)
	}catch(e){
		console.log(e);
		callback({
			code: 1, 
			message: e
		})
	}
};

// 存储登录状态
const saveAuth = (mobile, callback) => {
	const token = uuid.v1()	;
	RedisClient.set('NYLZAPP_AUTH:'+token, mobile, (err, ret) => {
		console.log("saveAuth:", ret);
		callback(err, token)
	})
};

// 获取登录状态
const checkAuth = (token, callback) => {
	RedisClient.get('NYLZAPP_AUTH:'+token, (err, ret) => {
		callback(err, ret)
	})
};

// 清除登录状态
const clearAuth = (token, callback) => {
	RedisClient.del('NYLZAPP_AUTH:'+token, (err, ret) => {
		callback(err, ret)
	})
};

//绑定用户
Server.post('/bindUser', (req, res) => {
    const data = req.body;
    console.log('POST：/bindUser, 参数：', data);

    if (!data.code) {
        res.send({
            code: 1000,
            message: '缺少参数：code'
        });
        return
    } else if (!data.userName) {
        res.send({
            code: 1001,
            message: '缺少参数：员工姓名'
        });
        return
    } else if (!data.mobile) {
        res.send({
            code: 1002,
            message: '缺少参数：手机号码'
        });
        return
    }
    else if (!data.companyId) {
        res.send({
            code: 1003,
            message: '缺少参数：企业编号'
        });
        return
    }
    /*
    检查用户是否绑定，如果已经绑定直接返回
     */
    users.findOne({mobile:data.mobile},function(err, userInfo) {
			if(!err &&userInfo){
                console.log("user have binded:",data.userName);
                //保存认证
                saveAuth(data.mobile, (err, ret) => {
                    console.log('token:', ret)
                    //结果返回给用户
                    res.send({
                        code: 0,
                        data: {
                            token:ret,
                            companyName: userInfo.companyName,
                            companyAddr: userInfo.companyAddr
                        }
                    })
                });
				return;
			}
			//查找公司ID是否有效
			company.findOne({license:data.companyId},function(err, comInfo){
				if( err || !comInfo) {
					res.send({
						code: 1004,
						message: '无效的企业编码'
					});
					return
				}
                //合法企业ID，绑定用户
                const user = {
                    "userName":data.userName,
                    "mobile":data.mobile,
                    "companyName":comInfo.companyName,
                    "companyAddr":comInfo.companyAddr,
                    "license":data.companyId,
                    "created":new Date().getTime(),
                    "updated":new Date().getTime()
                }
                users.save(user, (err, ret) => {
                    if(err){
                        console.log("write db failed, username:",data.userName);
                        return;
                    }
                    //保存认证
                    saveAuth(data.mobile, (err, ret) => {
                        console.log('token:', ret)
                        //结果返回给用户
                        res.send({
                            code: 0,
                            data: {
                                token:ret,
                                companyName: comInfo.companyName,
                                companyAddr: comInfo.companyAddr
                            }
                        })
                    });
                });
			});
    })
});
// 小程序登录
Server.post('/signIn', (req, res) => {
	const data = req.body;
	console.log('POST：/signIn, 参数：', data);

	if(!data.code){
		res.send({
			code: 1,
			message: '缺少参数：code'
		});
		return
	}else if(!data.encryptedData){
		res.send({
			code: 1,
			message: '缺少参数：encryptedData'
		});
		return
	}else if(!data.iv){
		res.send({
			code: 1,
			message: '缺少参数：iv'
		});
		return
	}

	// 获取sessionkey
	getSessionKey(data.code, (err, ret) => {
		if(err){
			res.send(err);
			return
		}
		console.log(ret);
		// 解密
		decrypt(ret.session_key, data.encryptedData, data.iv, (err, ret) => {
			if(err){
				res.end(err);
				return
			}

			console.log(ret);
			// 保存用户信息
			const people = {
				peopleId: uuid.v1(),
				channel: 'wechat',
				unionId: (ret.unionId)?ret.unionId:ret.openId,
				name: ret.nickName,
				avatar: ret.avatarUrl,
				created: new Date().getTime(),
				updated: new Date().getTime()
			};
			Peoples.findAndModify({
				query: {
					channel: 'wechat',
					unionId: (ret.unionId)?ret.unionId:ret.openId
				},
				update: {
					"$set": {
						name: ret.nickName,
						avatar: ret.avatarUrl,
						updated: new Date().getTime()
					}
				}
			}, (err, exist) => {
				if(!exist){ // 不存在帐户，创建新帐户
					Peoples.save(people, (err, ret) => {
						// 保存登录状态
						saveAuth(people.peopleId, (err, ret) => {
							res.send({
								code: 0,
								data: {
									token: ret,
									people: people
								}
							})
						})
					});
					return
				}else{ // 存在帐户
					// 保存登录状态
					saveAuth(exist.peopleId, (err, ret) => {
						console.log('token:', ret)
						res.send({
							code: 0,
							data: {
								token: ret,
								people: exist 
							}
						})
					})
				}
			})
		})	
	})

});

// 退出登录
Server.post('/signOut', (req, res) => {
	const data = req.body;
	console.log('POST：/signOut, 参数：', data);
	if(!data.token){
		res.send({
			code: 1,
			message: '缺少参数：token'
		});
		return
	}
	clearAuth(data.token, (err, ret) => {
		if(err){
			res.send({
				code: 1,
				message: '退出出错'
			});
			return
		}
		res.send({
			code: 0,
			data: {}
		})
	})
});

// 发送消息
Server.post('/messages', (req, res) => {
	const data = req.body;
	console.log('POST: /messages，参数：', data);
	if(!data.token){
		res.send({
			code: 1,
			message: '缺少参数：token'
		});
		return
	}

	checkAuth(data.token, (err, ret) => {
		console.log('checkAuth', err, ret);
		if(err){
			res.send({
				code: 1,
				message: '服务器故障'
			});
			return
		}else if(!ret){
			res.send({
				code: 1,
				message: '授权失败，请重新登录'
			});
			return
		}
		
		// 这里实现发送逻辑，这里用获取个人信息说明token -> people
		Peoples.findOne({peopleId: ret}, (err, ret) => {
			console.log('people:', err, ret);
			res.send({
				code: 0,
				data: {
					name: ret.name
				}
			})
		})
	})
});

/********** 业务处理结束 **********/

// 监听端口开启api服务
Server.listen(PORT, () => {
	console.log('开启服务器，端口号：', PORT)
});
