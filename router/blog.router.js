const app = require('express');
const { getAllBlog, getBlog, getBlogCategory, getAllBlogCategory } = require('../controller/blog.controller');
const router = app.Router()

//////////////// blog
router.get("/getAllBlog", getAllBlog) //////// getAll blog
router.get("/getBlog", getBlog) //////// get blog

///////////////////blogCategory
router.get("/getBlogCategory", getBlogCategory) //////// get blog
router.get("/getAllBlogCategory", getAllBlogCategory) //////// get blog


module.exports  = router;