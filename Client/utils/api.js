/*
* 作者： 刘焱旺 yw@getweapp.com
* 答疑交流QQ群：499859691
*/

// 这里可以使用自己服务器的接口
const API = 'http://172.31.52.40:5301'

const get = (cmd, params, callback) => {
  wx.request({
    url: API + (cmd ? ('/' + cmd) : ''),
    data: params,
    success: (res) => {
      if (typeof (callback) == 'function')
        callback(null, res.data)
    },
    fail(e) {
      console.error(e)
      callback(e,null)
    }
  })
}

const post = (cmd, params, callback) => {
  wx.request({
    url: API + (cmd ? ('/' + cmd) : ''),
    data: params,
    method: 'POST',
    success: (res) => {
      if (typeof (callback) == 'function')
        callback(null, res.data)
    },
    fail(e) {
      console.error(e)
      callback(e,null)
    }
  })
}

export default {
  get: get,
  post: post
}