var express = require('express');
var router = express.Router();

//
var mongoose = require('mongoose');
var User = require('../models/users')


//连接mongoose
mongoose.connect('mongodb://127.0.0.1:27017/booksDB', { useNewUrlParser: true });

mongoose.connection.on('connected', function () {
  console.log('mongodb connected success')
});
mongoose.connection.on('error', function () {
  console.log('mongodb connected error')
})
mongoose.connection.on('disconnected', function () {
  console.log('mongodb connected disconnected')
})




/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* 登录 */
router.post('/login', function (req, res, next) {
  var params = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }

  User.findOne(params, function (err, user) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      if (user) {
        res.cookie('userId', user.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 60
        });
        res.cookie('userName', user.userName, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 60
        });

        res.json({
          status: '0',
          msg: '',
          result: {
            userName: user.userName
          }
        })

      }
    }
  })
});

/* 拦截登录 */
router.get('/checkLogin', function (req, res, next) {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
});

/* 退出 */
router.post('/logout', function (req, res, next) {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  });
  res.cookie('userName', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})

/**
 *购物车模块
 *
 */

/* 获取购物车列表 */
router.get('/cartList', function (req, res, next) {
  let userId = req.cookies.userId;
  User.findOne({ userId: userId }, function (err, userDoc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (userDoc) {
        res.json({
          status: '0',
          msg: '',
          result: userDoc.cartList
        })
      }
    }
  })
})

/* 更新用户购物车数量等信息 */
router.post('/editCart', function (req, res, next) {
  let userId = req.cookies.userId;
  let productNum = req.body.productNum;
  let checked = req.body.checked;
  let productId = req.body.productId

  User.update(
    { 'userId': userId, 'cartList.productId': productId },
    { 'cartList.$.productNum': productNum, 'cartList.$.checked': checked },
    function (err, user) {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        if (user) {
          res.json({
            status: '0',
            msg: '',
            result: 'success'
          })
        }
      }
    })
})

/* 删除购物车 */
router.post('/delCartConfirm', function (req, res, next) {
  let userId = req.cookies.userId;
  let productId = req.body.productId;

  User.update({ userId:userId }, {
    $pull: {
      'cartList': {'productId': productId}
    }
  }, function (err, doc) {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: 'success'
        })
      }
    }
  })
})

/* 全选 */
router.post('/checkAll',function(req,res,next){
  let userId = req.cookies.userId;
  let checkAll = req.body.checkAll ? '1':'0';

  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        doc.cartList.forEach(item => {
          item.checked = checkAll
        });
        doc.save(function(err,doc1){
          if(err){
            res.json({
              status:'1',
              msg:err.message,
              result:''
            })
          }else{
            if(doc1){
              res.json({
                status:'0',
                msg:'',
                result:'success'
              })

            }
          }
        })
      }
    }
  })
})

/**
 *地址模块
 *
 */

 //获取地址列表
router.get('/addressList',function(req,res,next){
  let userId = req.cookies.userId;

  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        statue:'1',
        msg:err.message,
        result:'',
      })
    }else{
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:doc.addressList
        })
      }
    }
  })
})

// 删除地址

router.post('/delConfirm',function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;

  User.update({userId:userId},{
    $pull:{'addressList':{'addressId':addressId}}
  },function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:'',
      })
    }else{
      if(doc){
        res.json({
          status:'0',
          msg:'',
          result:'sucess',
        })
      }
    }
  })
})

// 修改默认地址
router.post('/setDefault',function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;

  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:'1',
        msg:err.message,
        result:'',
      })
    }else{
      if(doc){
        doc.addressList.forEach(item => {
          if(item.addressId == addressId){
            item.isDefault = true
          }else{
            item.isDefault = false
          }
          
        });
        doc.save(function(err1,doc){
          if(err1){
            res.json({
              status:'1',
              msg:err1.message,
              result:'',
            })
          }else{
            res.json({
              status:'0',
              msg:'',
              result:'success',
            })
          }
        })
      }
    }
  })
})

/* 订单模块 */
// 确认订单
router.post('/payMent',function(req,res,next){
  let userId = req.cookies.userId;
  let addressId = req.body.addressId;
  let orderTotal = req.body.orderTotal;

  User.findOne({userId:userId},function(err, user){
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result:''
      })
    }else{
      let address = '';
      let goodsList = [];
      //获取当前用户的地址信息
      user.addressList.forEach(item => {
        if(addressId == item.addressId){
          address = item
        }
      });
      //获取用户购物车购买的商品
      user.cartList.filter(item=>{
        if(item.checked == '1'){
          goodsList.push(item)
        }
      });

      //处理订单id
      let platform = '979';
      let r1 = Math.floor(Math.random()*10);
      let r2 = Math.floor(Math.random()*10);

      var sysDate = 121234;
      var createDate = 332554;
      let orderId = platform + r1 +sysDate + r2;
      let order = {
        orderId:orderId,
        orderTotal:orderTotal,
        addressInfo:address,
        goodsList:goodsList,
        orderStatus:'1',
        createDate:createDate
      };

      user.orderList.push(order);

      user.save(function (err1,doc1) {
        if(err1){
          res.json({
            status:"1",
            msg:err1.message,
            result:''
          });
        }else{
          res.json({
            status:"0",
            msg:'',
            result:{
              orderId:order.orderId,
              orderTotal:order.orderTotal
            }
          });
        }
     });
    } 
  })
})

//订单成功
router.get('/orderSuccess',function(req,res,next){
  let userId = req.cookies.userId;
  let orderId = req.param('orderId');

  User.findOne({userId:userId},function(err,user){
    if(err){
      res.json({
        status:'0',
        msg:err.message,
        status:'',
      })
    }else{
      if(user.orderList.length>0){
        var orderTotal = 0;
        user.orderList.forEach(item =>{
          if(item.orderId == orderId){
              orderTotal =  item.orderTotal            
          }
        });
        if(orderTotal>0){
          res.json({
            status:'0',
            msg:'',
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }else{
          res.json({
            status:'120002',
            msg:'无此订单',
            result:''
          });
        }
      }else{
        res.json({
          status:'10000',
          msg:'无此订单',
          result:''
        });
      } 
    }
  })
})


module.exports = router;
