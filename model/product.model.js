const mongoose = require("mongoose");
const Schema=mongoose.Schema

const taxSchema = new Schema({
    gst: { type: Number, required: false },
    include: { type: Boolean, required: false },
});
const metaSchema = new Schema({
    title: { type: String, required: false },
    description: { type: String, required: false },
    image: { type: Schema.Types.ObjectId,ref: "ImgUrl" },
    keyword:{type:String, required: false}
});

const produect = new mongoose.Schema({ 
    name:{
        type:String,
        required:false
    },
    slug:{
        type:String,
        required:false
    },
    sku:{
        type:String,
        required:false
    },
    saleprice:{
        type:Number,
        required:true
    },

    //Saleprice-90
    regularprice:{
        type:Number,
        required:true,
        default: 0
    },
    discount:{
        type:Number,
        required:false,
        default: 0
    },
    image:{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
    },
    gallery:[{
        type: Schema.Types.ObjectId,
        ref: "ImgUrl",
    }],
    description:{
        type:String,
        required:false
    },
    category: [{
        type: Schema.Types.ObjectId,
        ref: "Category",
    }],
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: "Tags",
    }],
    tax:{
        type:taxSchema
    },
    meta:{
        type: metaSchema
    },
    weight:{
        type: Number,
        required: false
    },
    isPublished:{
        type: Boolean,
        default: false 
    },
    isDeleted: { 
        type: Boolean,
        default: false 
    },
    isInWishlist:{
        type: Boolean,
        default: false 
    },
    review: {
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    stock: { type: Number, required: true, default: 0 },
    relatedProducts: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],
    boughtFrequently: {
        type: Schema.Types.ObjectId,
        ref: "BoughtFrequently"
    }
},
{ timestamps:true }
)





const Product = new mongoose.model("Product", produect)
module.exports = Product



////////////////////////////////////////
// {
//     "productId": "650bf7f5b3d632a529b490e8",
//     "quantity": 1,
//     "couponcode": "DISCOUNT2023",
//     "frequentlyBoughtIds": [
//         "650c0d6b9e760ab123abc456",
//         "650c0d6b9e760ab123abc789"
//     ]
// }

// "review": {
//   "averageRating": 5,
//  "totalReviews": 25
// },


// "boughtFrequently": [
//                 {
//                     "_id": "66c5a16457984ae74dbfaff8",
//                     "products": [
//                         {
//                             "productId": {
//                                 "_id": "665d8d0d937990c431312058",
//                                 "name": "Yellow Pages Data Extractor",
//                                 "isPublished": true,
//                                 "isFeatured": true,
//                                 "isDisable": false,
//                                 "isDeleted": false,
//                                 "regularPrice": 0,
//                                 "salePrice": 0,
//                                 "discount": 0,
//                                 "brandId": "665d6f68f6abaa6b2a331510",
//                                 "stock": 0,
//                                 "createdAt": "2024-06-03T09:29:49.361Z",
//                                 "updatedAt": "2024-08-09T05:46:04.491Z",
//                                 "__v": 4,
//                                 "badgeId": "66b5ad1c4b84a6e3cc2ea64b",
//                                 "products": [],
//                                 "id": "665d8d0d937990c431312058"
//                             },
//                             "variationId": "665d8d0d937990c43131205f",
//                             "discountType": "percentage",
//                             "discount": 20,
//                             "_id": "66c5a16457984ae74dbfaff9"
//                         },
//                     ],
//                     "title": "Buy this together",
//                     "createdAt": "2024-08-21T08:12:20.168Z",
//                     "updatedAt": "2024-08-21T08:12:20.168Z",
//                     "__v": 0,
//                     "id": "66c5a16457984ae74dbfaff8"
//                 }
// ],



