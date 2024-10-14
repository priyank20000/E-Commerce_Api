const app = require('express');
const {  getSingleUser, updateUserRole, userDelet, userAllDetails } = require('../controller/user.Controller');
const { imageCreate, updateImage, getAllImages, deleteImage, getImage } = require('../controller/image.controller');
const { categoryCreate, deleteCategory, downloadXlsxCategoryFile, uploadXlsxCategoryFile, downloadJsonCategoryFile, uploadJsoncategorysFile } = require('../controller/category.controller');
const { brandCreate, deleteBrand, updateBrand, downloadXlsxBrandFile } = require('../controller/brand.controller');
const { productCreate, updateProduct, downloadXlsxProductsFile, updatedisPublished, uploadXlsxProductsFile, downloadJsonProductsFile, uploadJsonProductsFile, getAllProductAdmin, deleteProduct } = require('../controller/product.controller');
const { createBlog, deleteBlog, blogCategory, getAllBlogCategoryAdmin } = require('../controller/blog.controller');
const { tagsCreate, deleteTags } = require('../controller/tags.controller');
const { createEvent, updateComment, deleteComment, getCommentsByEvent, getAllComments, deleteEvent, eventCategory } = require('../controller/event.controller');
const { adminCreate, adminlogin, roleCreate, permissionCreate, permissionNameCreate, dashboard, salesExpanse, compareSale } = require('../controller/admin.controller');
const adminAuth = require('../middleware/adminAuth');
const { getAllContactUs, deleteContactUs } = require('../controller/contactUs.controller');
const { createShiping, updateRequest } = require('../controller/order.controller');
const { addState, countryisPublished, getAllCountry, getisPublishedCountry, updateState, deleteState, stateisPublished, getCountryByState, getAllState, getisPublishedState } = require('../controller/addresses.controller');
const { sendNotification } = require('../controller/notification.controller');
const { isPublishedReview, getAllReviews, deleteReview } = require('../controller/reviews.controller');
const { createBoughtFrequently } = require('../controller/boughtFrequently.controller');

const router = app.Router()


///////////////admin ////////////////////////
router.post("/adminCreate", adminCreate)
router.post("/login", adminlogin) // role or ad

/////////////////////role and permission managemant /////////////////////
router.post("/roleCreate",  roleCreate)
router.post("/permissionCreate", permissionCreate)
router.post("/permissionNameCreate", permissionNameCreate)


///////////////// user ///////////////////////////

router.get("/users", adminAuth(['view_user']),  userAllDetails)  ///get all usre diteail (admin)
router.get("/getSingleUser", adminAuth(['view_single_user']),  getSingleUser)  ///get single usre diteail (admin)
router.post("/updateUserRole",   updateUserRole)  ///get single usre diteail (admin)
router.post("/userDelet", adminAuth(['user_delet']),  userDelet)  ///user delet (admin)


//remove decriment 
//////////////////// image  ////////////////////
router.post("/imageCreate", adminAuth(['image_create']),  imageCreate)  ///Image Create (admin)
router.post("/updateImage", adminAuth(['image_update']), updateImage)  ///Update Image (admin)
router.post("/deleteImage", adminAuth(['image_delete']),  deleteImage)  ///Delet Image (admin)
router.get("/getAllImages", adminAuth(['view_image']),  getAllImages)  ///get all Image (admin)
router.get("/getImage",  adminAuth(['view_single_image']), getImage)  ///get Image (admin)


///////////// category  /////
router.post("/categoryCreate", adminAuth(['category_create']),  categoryCreate)  /// Create Category (admin)
router.get("/downloadXlsxCategoryFile", adminAuth(['category_xlsx_download']), downloadXlsxCategoryFile)  /// Create Category (admin)
router.get("/downloadJsonCategoryFile", adminAuth(['category_json_download']), downloadJsonCategoryFile)  /// Create Category (admin)
router.post("/uploadXlsxCategoryFile", adminAuth(['category_xlsx_upload']),uploadXlsxCategoryFile)  /// Create Category (admin)
router.post("/uploadJsoncategorysFile", adminAuth(['category_json_upload']),uploadJsoncategorysFile)  /// Create Category (admin)
router.post("/deleteCategory", adminAuth(['category_delete']),  deleteCategory)  /// Delet Category (admin)


///////// brand .///////////////////////

router.post("/brandCreate", adminAuth(['brand_create']),  brandCreate)  /// Create brand (admin)
router.get("/downloadXlsxBrandFile", adminAuth(['brand_xlsx_download']), downloadXlsxBrandFile)  /// Create Category (admin)
router.post("/deleteBrand", adminAuth(['brand_delete']),  deleteBrand)  /// Delet brand (admin)
router.post("/updateBrand", adminAuth(['brand_update']),  updateBrand)  /// Update brand (admin)


////////////// product ///////////////

router.post("/productCreate", adminAuth(['product_create']),  productCreate)  /// Create Product (admin)
router.get("/downloadXlsxProductsFile",  downloadXlsxProductsFile)  /// Dowloade Product xlsx file (admin)
router.get("/downloadJsonProductsFile", adminAuth(['product_json_download']),  downloadJsonProductsFile)  /// Dowloade Product xlsx file (admin)
router.post("/uploadXlsxProductsFile", adminAuth(['product_xlsx_upload']),  uploadXlsxProductsFile)  /// Dowloade Product xlsx file (admin)
router.post("/uploadJsonProductsFile", adminAuth(['product_json_upload']),  uploadJsonProductsFile)  /// Dowloade Product xlsx file (admin)
router.post("/updateProduct", adminAuth(['product_update']),  updateProduct)  /// Update Product (admin)
router.post("/updatedisPublished", adminAuth(['isProduct_update']),  updatedisPublished)  /// Update Product (admin)
router.get("/getAllProductAdmin", adminAuth(['view_product']),  getAllProductAdmin)  /// get all product (admin)
router.post("/deleteProduct", adminAuth(['product_delete']),  deleteProduct)  /// delete Product (admin)
//////////// blog /////////////

router.post("/createBlog", adminAuth(['blog_create']),  createBlog)  /// Create Blog (admin)
router.post("/deleteBlog", adminAuth(['blog_delete']),  deleteBlog)  /// Create Blog (admin)

//////////// blog category /////////////

router.post("/createBlogCategory", adminAuth(['blog_category_create']),  blogCategory)  /// Create Blog Category (admin)
router.get("/getAllBlogCategoryAdmin", adminAuth(['view_blog_category']),  getAllBlogCategoryAdmin)  /// Create Blog Category (admin)

/////////////tags/////////////////

router.post("/tagsCreate", adminAuth(['tags_create']),  tagsCreate)  /// Create tags (admin)
router.post("/deleteTags", adminAuth(['tags_delete']),  deleteTags)  /// delete tags (admin)

/////////////Evens/////////////////
router.post("/eventCreate", adminAuth(['event_create']),  createEvent)  /// Create tags (admin)
router.post("/deleteEvent",  adminAuth(['event_delete']), deleteEvent)  /// Create tags (admin)

/////////Event Category /////////
router.post("/eventCategory", adminAuth(['event_category_create']),  eventCategory)  /// Create event category (admin)

////////////Event comment /////////
router.post("/updateComment", adminAuth(['comment_update']), updateComment) //////// get All comment event api
router.post("/deleteComment", adminAuth(['comment_delete']), deleteComment) //////// get All comment event api
router.get("/getCommentsByEvent", adminAuth(['view_single_comment']),  getCommentsByEvent) //////// get comment event api 
router.get("/getAllComments", adminAuth(['view_comment']),  getAllComments) //////// get All comment event api

/////////////contactUs ////////////
router.get("/getAllContactUs", adminAuth(['view_contact_us']),  getAllContactUs) //////// get All contact us api
router.post("/deleteContactUs", adminAuth(['contact_us_delete']),  deleteContactUs) //////// get All contact us api


///////////shipping /////////
router.post("/shippingCreate", adminAuth(['shipping_create']),  createShiping)  /// Create shipping (admin)

///// country
router.post("/countryIsPublished", adminAuth(['isPublished_Country_update']),  countryisPublished)  /// Create country (admin)\
router.get("/getAllCountry", adminAuth(['view_country']),  getAllCountry)  /// Create country (admin)\
router.post("/getIsPublishedCountry", getisPublishedCountry) 

///// state 
router.post("/stateCreate", adminAuth(['state_create']),  addState)  /// Create state (admin)
router.post("/updateState", adminAuth(['state_update']),  updateState)  /// Create state (admin)
router.post("/deleteState", adminAuth(['state_delete']),  deleteState)  /// Create state (admin)
router.post("/stateIsPublished", adminAuth(['isPublished_state_update']),  stateisPublished)  /// Create state (admin)
router.get("/getCountryByState", adminAuth(['view_country_by_state']),  getCountryByState)  /// Create state (admin)
router.get("/getAllState", adminAuth(['view_state']),  getAllState)  /// Create state (admin)
router.get("/getisPublishedState", getisPublishedState)  /// Create state (admin)



////////// notification /////////
// router.post("/sendNotification", adminAuth(['notification_create']),  sendNotification)  /// Create notification (admin)    
router.post("/sendNotification",  sendNotification)  /// Create notification (admin)    

///return router

router.post("/updateRequest", adminAuth(['request_update']),  updateRequest) //////// get All wishlist

///////// review /////////
router.post("/isPublishedReview", adminAuth(['isPublished_review']), isPublishedReview) //////// get All wishlist
router.get("/getAllReviews", adminAuth(['view_review']),  getAllReviews) //////// get All wishlist
router.post("/deleteReview", adminAuth(['delete_review']),  deleteReview) //////// get All wishlist

//////////DASHBOARD /////////
router.get("/dashboard", adminAuth(['dashboard']),  dashboard) //////// get All wishlist
router.get("/salesExpanse", adminAuth(['sales_expanse']),  salesExpanse) //////// get All wishlist
router.get("/compareSales", adminAuth(['compare_sales']),  compareSale) //////// get All wishlist

/////// BoughtFrequently /////////
router.post("/boughtFrequently", adminAuth(['bought_frequently']),  createBoughtFrequently) //////// get All wishlist


module.exports  = router;
