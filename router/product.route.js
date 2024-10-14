const app = require('express');
const { getCategory, getAllCategories } = require('../controller/category.controller');
const { getProduct, getAllProduct, productFilter } = require('../controller/product.controller');
const { getBrand, getAllBrand } = require('../controller/brand.controller');
const { getTags, getAllTags } = require('../controller/tags.controller');
const { addWishlist, removeWishList, getAllWishList } = require('../controller/wishlist.controller');
const { isAuthenticatedUser } = require('../middleware/auth');
const { createReview, reviewFilter, getReviews } = require('../controller/reviews.controller');
const { addToCart, getAllCart, removeCart } = require('../controller/cart.controller');
const handleGuestAccount = require('../middleware/handleGuestAccount');
const { createAddress, getAddresses, getAddressById, deleteAddress, updateAddress } = require('../controller/addresses.controller');
const { checkout, razorpay, razorpayVerify, requestCreate, totalOrder } = require('../controller/order.controller');
const { isAcceptedBoughtFrequently, getBoughtFrequently } = require('../controller/boughtFrequently.controller');

const router = app.Router()

///////////////////// Product

router.get("/getProduct", getProduct) //////// get product
// router.get("/getAllProduct", handleGuestAccount, isAuthenticatedUser, getAllProduct) //////// get product
router.get("/getAllProduct", getAllProduct) //////// get product



//////////////////// category

router.get("/getCategory", getCategory) //////// get category
router.get("/getAllCategories", getAllCategories)  ///////////// get all categories

/////////////////// Brand 
router.get("/getBrand", getBrand) //////// get brand
router.get("/getAllBrand", getAllBrand) //////// get all brand

////////////// Tags
router.get("/getTags", getTags) //////// get brand
router.get("/getAllTags", getAllTags) //////// get brand

//////////////////////////////wishlist

router.post("/addWishlist", handleGuestAccount,  isAuthenticatedUser, addWishlist) //////// add wishlist
router.post("/removeWishList", handleGuestAccount, isAuthenticatedUser , removeWishList) //////// remove wishlist
router.get("/getAllWishList", handleGuestAccount, isAuthenticatedUser, getAllWishList) //////// get All wishlist

////////////////////////////////////////////////////////////////////////////////////////////

// router.get("/productFilter",  productFilter) //////// get All wishlist
router.get("/productFilter", isAuthenticatedUser, productFilter) //////// get All wishlist

/////////////////////////////review
router.post("/createReview", isAuthenticatedUser, createReview) //////// get All wishlist
router.get("/reviewFilter",  reviewFilter) //////// get All wishlist
router.get("/getReview", getReviews) //////// get All wishlist

////////////////////////AddToCart
router.post("/cart", handleGuestAccount,  isAuthenticatedUser,  addToCart) //////// get All wishlist
// router.post("/cart", isAuthenticatedUser,  addToCart) //////// get All wishlist
router.get("/getAllCart", handleGuestAccount, isAuthenticatedUser,  getAllCart) 
router.post("/removeCart", handleGuestAccount, isAuthenticatedUser , removeCart)

////////////////////////////Address
router.post("/address", isAuthenticatedUser,  createAddress) //////// get All wishlist
router.get("/getAddress", isAuthenticatedUser,  getAddresses) //////// get All wishlist
router.get("/getAddressById", isAuthenticatedUser, getAddressById) //////// get All wishlist
router.post("/deleteAddress", isAuthenticatedUser,  deleteAddress) //////// get All wishlist
router.post("/updateAddress", isAuthenticatedUser,  updateAddress) //////// get All wishlist
/////////////// coutry

////////////////// checkout 
router.post("/checkout", isAuthenticatedUser,  checkout) //////// get All wishlist

/////////payment razorpay
router.post("/razorpay", isAuthenticatedUser,  razorpay) //////// get All wishlist
router.post("/razorpay/verify", isAuthenticatedUser,  razorpayVerify) //////// get All wishlist

////////////return router
router.post("/request", isAuthenticatedUser,  requestCreate) //////// get All wishlist
/////////
router.get("/totalOrder", totalOrder) //////// get All wishlist

/////////////// BoughtFrequently
router.post("/isAcceptedBoughtFrequently" , isAcceptedBoughtFrequently)
router.get("/getBoughtFrequently", getBoughtFrequently)


module.exports  = router;
