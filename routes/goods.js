var express = require('express');
var router = express.Router();
var Goods = require('../models/goods');

router.get('/goodsList', function (req, res, next) {
    Goods.find(function (err, doc) {
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
                    result: doc
                })
            }
        }
    })
});

router.get('/goodsDetail', function (req, res, next) {
    let productId = req.param('productId');
    Goods.find(function (err, doc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message,
                result: ''
            })
        } else {
            if (doc) {
                doc.forEach(item => {
                    if(item.productId == productId){
                        res.json({
                            status: '0',
                            msg: '',
                            result: item
                        })
                    }
                });

            }
        }

    })
})


//添加到购物车
router.post('/addCart', function (req, res, next) {
    var userId = req.cookies.userId;
    var productId = req.body.productId;
    console.log(productId)
    console.log(userId)
    var User = require('../models/users');

    User.findOne({ userId: userId }, function (err, userDoc) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            if (userDoc) {
                // console.log(userDoc)
                //判断购物车是否已经存在该商品，存在则num加一
                var goodsItem = '';
                userDoc.cartList.forEach(function (item) {
                    if (item.productId == productId) {
                        goodsItem = item;
                        item.productNum++;
                    }
                });
                //假如存在这一条，就保存
                if (goodsItem) {
                    userDoc.save(function (err2, doc2) {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: '',
                                result: 'suc'
                            })
                        }
                    })
                } else {//不存在就添加一条
                    Goods.findOne({productId:productId},function (err1, doc) {
                        if (err1) {
                            res.json({
                                status: '1',
                                msg: err1.message
                            })
                        } else {
                            if (doc) {
                                doc.productNum = '1';
                                doc.checked = '1';
                                userDoc.cartList.push(doc);
                                //    console.log(userDoc.cartList)
                                userDoc.save(function (err2, doc2) {
                                    if (err2) {
                                        res.json({
                                            status: '1',
                                            msg: err2.message
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: '',
                                            result: 'suc'
                                        })
                                    }
                                })
                            }
                        }
                    })
                }

            }
        }
    })
})


// 搜索功能
router.get('/search',function(req,res,next){
    let keyWords = req.param('keyWords');
    // console.log(keyWords)
    searchFinal = Goods.find(function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                resule:''
            })
        }else{
            if(doc){
                let serchResult = []
                doc.forEach(item => {
                    
                    if(item.productName.indexOf(keyWords) != -1){
                        serchResult.push(item)
                    }
                });
                // console.log(serchResult)
                searchFinal = serchResult
                res.json({
                    status:'0',
                    msg:'',
                    result:serchResult
                })
            }
        }
        
    })
    
})





module.exports = router;