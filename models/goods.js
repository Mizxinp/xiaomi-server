var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSchema = new Schema({
    "hotGoods": [
        {
            "productId": String,
            "productName": String,
            "salePrice": String,
            "productImage": String,
            "porductDesc": String,
            "productNum": String,
            "checked": String
        }
    ],
    "starGoods": [
        {
            "productId": String,
            "productName": String,
            "salePrice": String,
            "productImage": String,
            "porductDesc": String,
            "productNum": String,
            "checked": String
        }
    ]
})

module.exports = mongoose.model('Good', productSchema)