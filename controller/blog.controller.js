const Blog = require("../model/blog.model");
const blog = require("../model/blog.model");
const BlogCategory = require("../model/blogCategory.model");
const Category = require("../model/category.model");
const ImgUrl = require("../model/media.model");
const User = require("../model/user.model");
//////////////////////////////// create Blog (admin)
exports.createBlog = async (req, res, next) => {
    const {  title, image, description, category, authorName,isPublished } = req.body;
    const validation = {  title, image, description, authorName };
    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(200).json({ success: false, message: `${missingField} is missing` });
    }
    try {
        const categoryData = await BlogCategory.findById(category).lean().exec();
        if (!categoryData) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid Category ID"
            });
        }
        const imageData = await ImgUrl.findById(image).exec();
        if (!imageData) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid image ID"
            });
        }
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid user ID"
            });
        }
        const newBlog = await Blog.create({
            title,
            image,
            description,
            blog,
            createdBy: user,
            category,
            authorName,
            isPublished
        });
        if(!newBlog){
            res.status(200).json({ 
                success:false,
                message: "Blog Does Not Create"
            }); 
        }
        res.status(200).json({ 
            success:true,
            message: "Blog added successfully"
        });  
    } catch (error) {
        return res.status(200).json({ success: false, message: 'Internal Server Error' });
    }
}

///////////////////////// get all blog (user)
exports.getAllBlog = async(req, res, next) => {
    try {
        const BlogId = await Blog.find({isPublished: true})
        if(BlogId){
            res.status(200).json({success: true, BlogId})
        }else{
            return res.status(404).json({ success: false, message: "Blog Id Does not found" });
        }
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

/////////////////////// get blog (user)
exports.getBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.body.id); 
        if(blog.isPublished === false){
            return res.status(404).json({ success: false, message: "This Blog Is Not Found" });
        }
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        return res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////// delet Blog (admin) ////////////////////////
exports.deleteBlog = async (req, res, next) => {
    try {
        const blogId = req.body.id;
        if (!blogId) {
            return res.status(400).json({ success: false, message: "Blog ID is required in the request body" });
        }
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        const deletedBlog = await Blog.findByIdAndDelete(blogId);
        if (deletedBlog) {
            return res.status(200).json({ success: true, message: "Blog deleted successfully" });
        } else {
            return res.status(200).json({ success: false, message: "Error deleting blog" });
        }
    } catch (err) {
        return res.status(200).json({ success: false, message: "Server error" });
    }
};

////////////////////////// update Blog (admin) ////////////////
exports.updateBlog = async(req, res, next) => {
    try {
        const {name, description} =req.body
        const updateBlog = await Blog.findByIdAndUpdate(req.body.id, {name,description},{new:true})
        if(updateBlog){
            res.status(200).json({message:"Blog Update SuccessFully", updateBlog})
        }else{
            res.status(400).json({message:"Blog Not Found"})
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }    
}
//////////////////////////////////////////////////////////////////////////////

exports.blogCategory = async(req, res, next) => {
    const {name, slug, image, featuredCategory, description, isPublished} = req.body
    try {
        const requiredFields = { name, slug, description };
        const missingField = Object.keys(requiredFields).find(key => !requiredFields[key]);

        if (missingField) {
            return res.status(400).json({ success: false, message: `${missingField} is missing` });
        }
        
        const sanitizedSlug = slug.replace(/\s+/g, '-').toLowerCase();
        const newBlogCategory = new BlogCategory({
            name,
            slug: sanitizedSlug,
            image,
            featuredCategory,
            description,
            isPublished
        })

        const savedBlogCategory = await newBlogCategory.save();
        if (!savedBlogCategory) {
            return res.status(400).json({ success: false, message: "Blog Category not saved" });
        }

        res.status(200).json({ success: true, message: "Blog Category successfully added", data: savedBlogCategory });
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getBlogCategory = async(req, res, next) => {
    try {
        const blogCategory = await BlogCategory.findById(req.body.id)
        if(!blogCategory){
            return res.status(404).json({ success: false, message: "Blog Category not found" });
        }
        res.status(200).json({ success: true, blogCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getAllBlogCategory = async(req, res, next) => {
    try {
        const blogCategory = await BlogCategory.find({isPublished: true})
        if(!blogCategory){
            return res.status(404).json({ success: false, message: "Blog Category not found" });
        }
        res.status(200).json({ success: true, blogCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getAllBlogCategoryAdmin = async(req, res, next) => {
    try {
        const blogCategory = await BlogCategory.find()
        if(!blogCategory){
            return res.status(404).json({ success: false, message: "Blog Category not found" });
        }
        res.status(200).json({ success: true, blogCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.updateBlogCategory = async(req, res, next) => {
    try {
        const {name, slug, image, featuredCategory, description, isPublished} =req.body
        const updateBlogCategory = await BlogCategory.findByIdAndUpdate(req.body.id, {name,slug,image,featuredCategory,description,isPublished},{new:true})
        if(updateBlogCategory){
            res.status(200).json({message:"Blog Category Update SuccessFully", updateBlogCategory})
        }else{
            res.status(400).json({message:"Blog Category Not Found"})
        }    
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.isPublishedBlogCategory = async(req, res, next) => {
    try {
        const blogCategory = await BlogCategory.findById(req.body.id)
        if(!blogCategory){
            return res.status(404).json({ success: false, message: "Blog Category not found" });
        }
        const updateBlogCategory = !blogCategory.isPublished
        const savedBlogCategory = await BlogCategory.findByIdAndUpdate(req.body.id, {isPublished:updateBlogCategory},{new:true})
        if(!savedBlogCategory){
            return res.status(404).json({ success: false, message: "Blog Category not found" });
        }
        res.status(200).json({ success: true, message: "Blog Category successfully updated", message: "Blog Category successfully updated"});
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}