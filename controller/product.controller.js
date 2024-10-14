const Brand = require("../model/brand.model");
const Category = require("../model/category.model");
const ImgUrl = require("../model/media.model");
const Product = require("../model/product.model");
const mongoose = require('mongoose')
const Tags = require("../model/tags.model");
const ExcelJS = require('exceljs');
const ObjectId = mongoose.Types.ObjectId;
const WhistList = require("../model/wishlist.model");
// const NodeCache = require('node-cache');
// const productCache = new NodeCache({ stdTTL: 3600 }); 
// const { client, getAsync, setAsync } = require('../config/redis');

/////////////// create product (admin) ///////////////////
// exports.productCreate = async (req, res, next) => {
//     const { name, slug, sku, description, tax, meta, category, brand, tags, saleprice, regularprice, image, gallery, stock, weight,isPublished } = req.body;
//     const validation = { name, slug, sku, description, tax, meta, category, brand, tags, saleprice, regularprice, image, gallery, stock, weight };
//     const missingField = Object.keys(validation).find(key => validation[key] === undefined);
//     if (missingField) {
//         return res.status(400).json({ success: false, message: `${missingField} is missing` });
//     }
//     try {
//         const categoryData = await Category.find({ _id: { $in: category } }).lean().exec();
//         if (!categoryData || categoryData.length !== category.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid category IDs"
//             });
//         }
//         const brandData = await Brand.findById(brand).exec();
//         if (!brandData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid brand ID"
//             });
//         }
//         const imageData = await ImgUrl.findById(image).exec();
//         if (!imageData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid image ID"
//             });
//         }
//         const galleryData = await ImgUrl.findById(gallery).exec();
//         if (!galleryData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid gallery ID"
//             });
//         }
//         const tagsData = await Tags.findById(tags).exec();
//         if (!tagsData) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid Tags ID"
//             });
//         }
//         if (regularprice < saleprice) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Regular price cannot be less than sale price"
//             });
//         }
//         const discount = ((regularprice - saleprice) / regularprice) * 100;
//         const newProduct = await Product.create({
//             name,
//             slug: slug.replace(/\s+/g, '-'),
//             sku,
//             description,
//             tax,
//             meta,
//             category,
//             brand,
//             tags,
//             saleprice,
//             regularprice,
//             discount,
//             image,
//             gallery,
//             isPublished,
//             isInWishlist: false,
//             stock,
//             weight
//         });
//         if (!newProduct) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Product Does Not Create"
//             });
//         }
//         const relatedProducts = await Product.find({
//             _id: { $ne: newProduct._id },
//             category: { $in: category } 
//         }).limit(5); 
//         if (!relatedProducts) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No related products found"
//             });
//         }

//         await Promise.all(relatedProducts.map(async (product) => {
//             product.relatedProducts.push(newProduct._id);
//             await product.save();
//         }));

//         newProduct.relatedProducts = relatedProducts.map(product => product._id);
//         await newProduct.save();
//         res.status(200).json({
//             success: true,
//             message: "Product added successfully",
//             product: newProduct
//         });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };
exports.productCreate = async (req, res, next) => {
    const { name, slug, sku, description, tax, meta, category, brand, tags, saleprice, regularprice, image, gallery, stock, weight, isPublished } = req.body;

    const requiredFields = {  name, slug, sku, description, tax, meta, category, brand, tags, saleprice, regularprice, image, gallery, stock, weight };
    const missingField = Object.keys(requiredFields).find(key => requiredFields[key] === undefined);

    if (missingField) {
        return res.status(400).json({ success: false, message: `${missingField} is missing` });
    }

    // Additional validation
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: "Product name must be a non-empty string." });
    }
    
    if (typeof saleprice !== 'number' || saleprice <= 0) {
        return res.status(400).json({ success: false, message: "Sale price must be a positive number." });
    }

    if (typeof regularprice !== 'number' || regularprice <= 0) {
        return res.status(400).json({ success: false, message: "Regular price must be a positive number." });
    }

    if (regularprice < saleprice) {
        return res.status(400).json({
            success: false,
            message: "Regular price cannot be less than sale price",
        });
    }

    // Validate category IDs
    if (!Array.isArray(category) || category.length === 0) {
        return res.status(400).json({ success: false, message: "Categories must be an array and cannot be empty." });
    }

    // Validate brand ID
    if (!mongoose.Types.ObjectId.isValid(brand)) {
        return res.status(400).json({ success: false, message: "Invalid brand ID." });
    }

    // Validate image ID
    if (!mongoose.Types.ObjectId.isValid(image)) {
        return res.status(400).json({ success: false, message: "Invalid image ID." });
    }

   
    // Validate gallery IDs (if provided)
    if (gallery && !Array.isArray(gallery)) {
        return res.status(400).json({ success: false, message: "Gallery must be an array." });
    }

    // Validate tags IDs (if provided)
    if (tags && !Array.isArray(tags)) {
        return res.status(400).json({ success: false, message: "Tags must be an array." });
    }

    try {
        const categoryData = await Category.find({ _id: { $in: category } }).lean().exec();
        if (!categoryData || categoryData.length !== category.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid category IDs",
            });
        }

        const brandData = await Brand.findById(brand).exec();
        if (!brandData) {
            return res.status(400).json({
                success: false,
                message: "Invalid brand ID",
            });
        }

        const imageData = await ImgUrl.findById(image).exec();
        if (!imageData) {
            return res.status(400).json({
                success: false,
                message: "Invalid image ID",
            });
        }

        const galleryData = await ImgUrl.find({ _id: { $in: gallery } }).exec();
        if (gallery && (!galleryData || galleryData.length !== gallery.length)) {
            return res.status(400).json({
                success: false,
                message: "Invalid gallery IDs",
            });
        }

        const tagsData = await Tags.find({ _id: { $in: tags } }).exec();
        if (tags && (!tagsData || tagsData.length !== tags.length)) {
            return res.status(400).json({
                success: false,
                message: "Invalid tags IDs",
            });
        }

        const discount = ((regularprice - saleprice) / regularprice) * 100;

        const newProduct = await Product.create({
            name,
            slug: slug.replace(/\s+/g, '-'),
            sku,
            description,
            tax,
            meta,
            category,
            brand,
            tags,
            saleprice,
            regularprice,
            discount,
            image,
            gallery,
            isPublished,
            isInWishlist: false,
            stock,
            weight,
        });

        if (!newProduct) {
            return res.status(400).json({
                success: false,
                message: "Product does not create",
            });
        }

        const relatedProducts = await Product.find({
            _id: { $ne: newProduct._id },
            category: { $in: category },
        }).limit(5);

        if (!relatedProducts) {
            return res.status(400).json({
                success: false,
                message: "No related products found",
            });
        }

        await Promise.all(relatedProducts.map(async (product) => {
            product.relatedProducts.push(newProduct._id);
            await product.save();
        }));

        newProduct.relatedProducts = relatedProducts.map(product => product._id);
        await newProduct.save();

        res.status(200).json({
            success: true,
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error'});
    }
}; /////admin

/////////// prodect get diteal (user) ////////////////////
exports.getProduct =  async (req,res,next) =>{
    try {
        const prodect = await Product.findById(req.body.id).populate('category').populate('brand').populate('image').populate('gallery').populate('tags').populate('relatedProducts').populate('boughtFrequently');
        if (!prodect) {
            return res.status(200).json({
                success:false,
                message:"Product Not Found"
            })
        }
        res.status(200).json({
            success:true,
            prodect
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} ///user
////////// get all deta (user) /////////////////// 
exports.getAllProduct =  async (req,res,next) =>{
    try {
        const products = await Product.find({ isDeleted: false ,isPublished: true }).populate('category').populate('brand').populate('image').populate('gallery').populate('tags').populate('relatedProducts').populate('boughtFrequently');
        res.status(200).json({
            success:true,
            products
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
exports.getAllProductAdmin = async (req, res, next) => {
    try {
        const products = await Product.find().populate('category').populate('brand').populate('image').populate('gallery').populate('tags').populate('relatedProducts').populate('boughtFrequently');
        res.status(200).json({
            success:true,
            products
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
// productController.js
// exports.getAllProduct = async (req, res, next) => {
//     try {
//         const cacheKey = 'allProducts';
//         const cachedProducts = await productCache.get(cacheKey);
//         if (cachedProducts) {
//             return res.status(200).json({
//                 success: true,
//                 products: JSON.parse(cachedProducts)
//             });
//         }
//         const products = await Product.find({ isDeleted: false, isPublished: true })
//             .populate('category')
//             .populate('brand')
//             .populate('image')
//             .populate('gallery')
//             .populate('tags')
//             .populate('relatedProducts');
//         productCache.set(cacheKey, JSON.stringify(products), 3600);
       
//         res.status(200).json({
//             success: true,
//             products
//         });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }; //user // node-cache

// exports.getAllProductAdmin = async (req, res, next) => {
//     try {
//         const cacheKey = 'allProductsAdmin';
        
//         // Attempt to retrieve from cache
//         const cachedProducts = await productCache.get(cacheKey);
//         if (cachedProducts) {
//             console.log('Returning cached products');
//             return res.status(200).json({
//                 success: true,
//                 total: JSON.parse(cachedProducts).length,
//                 products: JSON.parse(cachedProducts)
//             });
//         }
        
//         // If cache is empty, fetch from the database
//         const products = await Product.find()
//             .populate('category')
//             .populate('brand')
//             .populate('image')
//             .populate('gallery')
//             .populate('tags')
//             .populate('relatedProducts');

//         productCache.set(cacheKey, JSON.stringify(products), 3600);
       
//         res.status(200).json({
//             success: true,
//             total: products.length,
//             products
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }; //////admin // node-cache

//////////// Update Prodect (admin) ///////////    
exports.updateProduct = async (req, res, next) => {
    const { id, name, slug, sku, description, tax, meta, category, brand, tags, saleprice, regularprice, image, gallery, stock, weight } = req.body;

    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product Not Found" });
        }

        const updateFields = {
            name: name || product.name,
            slug: slug ? slug.replace(/\s+/g, '-') : product.slug,
            sku: sku || product.sku,
            description: description || product.description,
            tax: tax || product.tax,
            meta: meta || product.meta,
            category: category || product.category,
            brand: brand || product.brand,
            tags: tags || product.tags,
            saleprice: saleprice != null ? saleprice : product.saleprice,
            regularprice: regularprice != null ? regularprice : product.regularprice,
            image: image || product.image,
            gallery: gallery || product.gallery,
            stock: stock != null ? stock : product.stock,
            weight: weight || product.weight
        };

        if (category) {
            const categoryData = await Category.find({ _id: { $in: category } }).lean().exec();
            if (!Array.isArray(categoryData) || categoryData.length !== category.length) {
                return res.status(400).json({ success: false, message: "Invalid category IDs" });
            }
        }
        if (brand) {
            const brandData = await Brand.findById(brand).exec();
            if (!brandData) {
                return res.status(400).json({ success: false, message: "Invalid brand ID" });
            }
        }
        if (tags) {
            const tagsData = await Tags.findById(tags).exec();
            if (!tagsData) {
                return res.status(400).json({ success: false, message: "Invalid Tags ID" });
            }
        }
        if (image) {
            const imageData = await ImgUrl.findById(image).exec();
            if (!imageData) {
                return res.status(400).json({ success: false, message: "Invalid image ID" });
            }
            updateFields.image = imageData._id;
        }

        if (updateFields.regularprice < updateFields.saleprice) {
            return res.status(400).json({ success: false, message: "Sale price cannot be higher than regular price" });
        }

        if (updateFields.regularprice && updateFields.saleprice != null) {
            const discountAmount = updateFields.regularprice - updateFields.saleprice;
            updateFields.discount = (discountAmount / updateFields.regularprice) * 100;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true, useFindAndModify: false }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product Not Found" });
        }

        // const cacheKeys = ['allProductsAdmin', 'allProducts'];

        // cacheKeys.forEach(key => productCache.del(key));
        
        res.status(200).json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}; ////admin

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.body.id);
        if (!product) {
            return res.status(404).json({ status: false, message: "Product not found!" });
        }
        // const cacheKeys = ['allProductsAdmin', 'allProducts'];
        // cacheKeys.forEach(key => productCache.del(key));

        res.status(200).json({ status: true, message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
};

exports.updateMultipleProducts = async (req, res) => {
    try {
        const productsToUpdate = req.body.products;
        if (!productsToUpdate || !Array.isArray(productsToUpdate) || productsToUpdate.length === 0) {
            return res.status(400).json({ status: false, message: "Invalid products data!" });
        }
        for (const productData of productsToUpdate) {
            const { product_id, regularprice, price, category, isDeleted, stock, brand } = productData;
            if (!product_id || !mongoose.isValidObjectId(product_id)) {
                return res.status(400).json({ product_id, status: false, message: "Invalid or missing product ID!" });
            }
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ product_id, status: false, message: "Product not found!" });
            }
            if (regularprice !== undefined && price !== undefined && regularprice < price) {
                return res.status(400).json({ product_id, status: false, message: "Regular price must be greater than sale price!" });
            }
            if (category && (!mongoose.isValidObjectId(category) || !(await Category.exists({ _id: category })))) {
                return res.status(400).json({ product_id, status: false, message: "Invalid or non-existent category ID!" });
            }
            if (brand && (!mongoose.isValidObjectId(brand) || !(await Brand.exists({ _id: brand })))) {
                return res.status(400).json({ product_id, status: false, message: "Invalid or non-existent brand ID!" });
            }
            let discount;
            if (regularprice && price) {
                discount = Math.round((regularprice - price) / regularprice * 100);
            } else {
                discount = product.discount;
            }
            if (regularprice !== undefined) {
                product.regularprice = regularprice;
            }
            if (price !== undefined) {
                product.saleprice = price;
            }
            if (category) {
                product.category = category;
            }
            if (isDeleted !== undefined) {
                product.isDeleted = isDeleted;
            }
            if (stock !== undefined) {
                product.stock = stock;
            }
            if (brand) {
                product.brand = brand;
            }
            product.discount = discount;
            product.updatedAt = new Date();
            await product.save();
        }
        // const cacheKeys = ['allProductsAdmin', 'allProducts'];
        // cacheKeys.forEach(key => productCache.del(key));
        return res.status(200).json({ status: true, message: "Products updated successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "An error occurred while updating the products." });
    }
}; //////admin
/////////////////// xlsx file dowloade 
exports.downloadXlsxProductsFile = async (req, res, next) => {
    try {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const products = await Product.find()
            .populate('category', '_id name') 
            .populate('brand', '_id name') 
            .populate('tags', '_id tag') 
            .populate('image')
            .populate('gallery');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Sale Price', key: 'saleprice', width: 15 },
            { header: 'Regular Price', key: 'regularprice', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Category', key: 'category', width: 50 },
            { header: 'Brand', key: 'brand', width: 50 },
            { header: 'Tags', key: 'tags', width: 50 },
            { header: 'GST', key: 'gst', width: 15 },
            { header: 'Include Tax', key: 'include_tax', width: 15 },
            { header: 'Meta Title', key: 'meta_title', width: 30 },
            { header: 'Meta Description', key: 'meta_description', width: 50 },
            { header: 'Meta Image', key: 'meta_image', width: 50 },
            { header: 'Meta Keywords', key: 'meta_keywords', width: 50 },
            { header: 'Image', key: 'image', width: 50 },
            { header: 'Gallery', key: 'gallery', width: 50 },
            { header: 'Is Published', key: 'is_published', width: 15 },
            { header: 'Is Deleted', key: 'is_deleted', width: 15 },
            { header: 'Is In Wishlist', key: 'is_in_wishlist', width: 15 },
            { header: 'Stock', key: 'stock', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 30 },
            { header: 'Updated At', key: 'updatedAt', width: 30 },
            { header: '__v', key: '__v', width: 10 }
        ];

        const rows = products.map(product => {
            const categories = product.category ? product.category.map(cat => ({
                _id: cat._id.toString(),
                name: cat.name
            })) : [];

            const tags = product.tags ? product.tags.map(tag => ({
                _id: tag._id.toString(),
                name: tag.tag
            })) : [];

            const brand = product.brand ? {
                _id: product.brand._id.toString(),
                name: product.brand.name
            } : {};

            const meta = product.meta || {};
            const gst = product.tax ? product.tax.gst : '';
            const include_tax = product.tax ? product.tax.include : '';

            const imageUrl = product.image && product.image.url ?
                (product.image.url.startsWith('http') ? product.image.url : baseUrl + product.image.url) : '';

            const imageField = product.image ? [{ _id: product.image._id.toString(), url: imageUrl }] : [];
            const galleryImages = product.gallery ? product.gallery.map(img => ({
                _id: img._id.toString(),
                url: img.url ? (img.url.startsWith('http') ? img.url : baseUrl + img.url) : ''
            })) : [];

            const metaImageField = meta.image ?
                (typeof meta.image === 'string' ? [{ _id: product._id.toString(), url: meta.image }] :
                [{ _id: meta.image._id.toString(), url: meta.image.url }]) : [];

            return {
                name: product.name || '',
                sku: product.sku || '',
                saleprice: product.saleprice || 0,
                regularprice: product.regularprice || 0,
                discount: product.discount || 0,
                description: product.description || '',
                category: JSON.stringify(categories),
                brand: JSON.stringify(brand),
                tags: JSON.stringify(tags),
                gst: gst,
                include_tax: include_tax,
                meta_title: meta.title || '',
                meta_description: meta.description || '',
                meta_image: JSON.stringify(metaImageField),
                meta_keywords: meta.keywords || '',
                image: JSON.stringify(imageField),
                gallery: JSON.stringify(galleryImages),
                is_published: product.isPublished,
                is_deleted: product.isDeleted,
                is_in_wishlist: product.isInWishlist,
                stock: product.stock || 0,
                createdAt: product.createdAt ? product.createdAt.toLocaleString() : '',
                updatedAt: product.updatedAt ? product.updatedAt.toLocaleString() : '',
                __v: product.__v || 0
            };
        });

        worksheet.addRows(rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error generating XLSX file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; //////admin


///////////////////////////////////////// xlsx to json upload in db
exports.uploadXlsxProductsFile = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const workbook = new ExcelJS.Workbook();
        const buffer = req.files.file.data;
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet('Products');
        if (!worksheet) {
            return res.status(400).json({ success: false, message: 'Invalid Excel file format: Missing "Products" worksheet' });
        }
        const products = [];
        const objectIdExists = async (id, model) => {
            try {
                const doc = await model.findById(id);
                return !!doc;
            } catch (error) {
                return false;
            }
        };
        for (let rowNumber = 2; rowNumber <= worksheet.actualRowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const categories = JSON.parse(row.getCell(7).value);
            const brand = JSON.parse(row.getCell(8).value);
            const tags = JSON.parse(row.getCell(9).value);
            const metaImage = JSON.parse(row.getCell(14).value);
            const image = JSON.parse(row.getCell(16).value);
            const gallery = JSON.parse(row.getCell(17).value);
            const isValidBrand = await objectIdExists(brand._id, Brand);
            if (!isValidBrand) {
                return res.status(400).json({
                    success: false,
                    message: `Object with id ${brand._id} not found in brand`
                });
            }
            for (const cat of categories) {
                const isValidCategory = await objectIdExists(cat._id, Category);
                if (!isValidCategory) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${cat._id} not found in category`
                    });
                }
            }
            for (const tag of tags) {
                const isValidTag = await objectIdExists(tag._id, Tags);
                if (!isValidTag) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${tag._id} not found in tags`
                    });
                }
            }
            for(const img of image) {                
                const isValidImage = await objectIdExists(img._id, ImgUrl);
                if (!isValidImage) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${img._id} not found in image`
                    });
                }
            }
            for(const mimg of metaImage) {
                const isValidImage = await objectIdExists(mimg._id, ImgUrl);
                if (!isValidImage) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${mimg._id} not found in metaImage`
                    });
                }
            }
            for (const gall of gallery) {
                const isValidGallery = await objectIdExists(gall._id, ImgUrl);
                if (!isValidGallery) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${gall._id} not found in gallery`
                    });
                }
            }           
            const regularprice = row.getCell(4).value;
            const saleprice = row.getCell(3).value;
            if (regularprice < saleprice) {
                return res.status(400).json({
                    success: false,
                    message: `Regular price (${regularprice}) cannot be less than sale price (${saleprice})`,
                    productName: row.getCell(1).value 
                });
            }
            const productData = {
                name: row.getCell(1).value,
                sku: row.getCell(2).value,
                saleprice: saleprice,
                regularprice: regularprice,
                discount: row.getCell(5).value,
                description: row.getCell(6).value,
                category: categories.map(cat => new ObjectId(cat._id)),
                brand: new ObjectId(brand._id),
                tags: tags.map(tag => new ObjectId(tag._id)),
                tax:{
                    gst: row.getCell(10).value,
                    include: row.getCell(11).value,
                },
                meta: {
                    title: row.getCell(12).value,
                    description: row.getCell(13).value,
                    image: metaImage.map(mimg => new ObjectId(mimg._id)),
                    keyword: row.getCell(15).value
                },
                image: image.map(img => new ObjectId(img._id)),
                gallery: gallery.map(gall => new ObjectId(gall._id)),
                is_published: row.getCell(18).value,
                is_deleted: row.getCell(19).value,
                is_in_wishlist: row.getCell(20).value,
                stock: row.getCell(21).value
            };
            products.push(productData);
        }
        await Product.insertMany(products);
        res.status(200).json({ success: true, message: 'Products added successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}; ////admin
//////////////////////////////// json file dowloade
exports.downloadJsonProductsFile = async (req, res) => {
    try {
        const products = await Product.find();
        if (!products || products.length === 0) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }
        const productsJson = JSON.stringify(products, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=products.json');
        res.send(productsJson);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}; ///// admin
/////////////////////////////////////////// json file upload in db
exports.uploadJsonProductsFile = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const jsonData = JSON.parse(req.files.file.data.toString());
        const products = [];
        const objectIdExists = async (id, model) => {
            try {
                const doc = await model.findById(id);
                return !!doc;
            } catch (error) {
                return false;
            }
        };
        for (let i = 0; i < jsonData.length; i++) {
            const data = jsonData[i];
            const isValidBrand = await objectIdExists(data.brand, Brand);
            if (!isValidBrand) {
                return res.status(400).json({
                    success: false,
                    message: `Object with id ${data.brand} not found in brand`
                });
            }
            for (const cat of data.category) {
                const isValidCategory = await objectIdExists(cat, Category);
                if (!isValidCategory) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${cat} not found in category`
                    });
                }
            }
            for (const tag of data.tags) {
                const isValidTag = await objectIdExists(tag, Tags);
                if (!isValidTag) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${tag} not found in tags`
                    });
                }
            }
                const isValidImage = await objectIdExists(data.image, ImgUrl);
                if (!isValidImage) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${data.image} not found in image`
                    });
                }
                const isValidMetaImage = await objectIdExists(data.meta.image, ImgUrl);
                if (!isValidMetaImage) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${data.meta.image} not found in metaImage`
                    });
                }
            for (const gall of data.gallery) {
                const isValidGallery = await objectIdExists(gall, ImgUrl);
                if (!isValidGallery) {
                    return res.status(400).json({
                        success: false,
                        message: `Object with id ${gall} not found in gallery`
                    });
                }
            }
            const regularprice = data.regularprice;
            const saleprice = data.saleprice;
            if (regularprice < saleprice) {
                return res.status(400).json({
                    success: false,
                    message: `Regular price (${regularprice}) cannot be less than sale price (${saleprice})`,
                    productName: data.name
                });
            }
            const productData = {
                name: data.name,
                sku: data.sku,
                saleprice: saleprice,
                regularprice: regularprice,
                discount: data.discount,
                description: data.description,
                category: data.category.map(cat => new ObjectId(cat._id)),
                brand: new ObjectId(data.brand._id),
                tags: data.tags.map(tag => new ObjectId(tag._id)),
                tax: {
                    gst: data.tax.gst,
                    include: data.tax.include,
                },
                meta: {
                    title: data.meta.title,
                    description: data.meta.description,
                    image: new ObjectId(data.meta.image._id),
                    keyword: data.meta.keyword
                },
                image: new ObjectId(data.image._id),
                gallery: data.gallery.map(gall => new ObjectId(gall._id)),
                is_published: data.is_published,
                is_deleted: data.is_deleted,
                is_in_wishlist: data.is_in_wishlist,
                stock: data.stock
            };
            products.push(productData);
        }
        await Product.insertMany(products);
        res.status(200).json({ success: true, message: 'Products added successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}; ///////admin

////////////// isPubllic (true or false) //
exports.updatedisPublished = async (req, res, next) => {
    try {
        const product = await Product.findById(req.body.id);
        if (!product) {
            return res.status(200).json({
                success: false,
                message: "Product Not Found"
            });
        }
        const updatedIsPublished = !product.isPublished;
        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            { isPublished: updatedIsPublished },
            { new: true }
        );
        if (!updatedProduct) {
            return res.status(200).json({ success: false, message: "Product Not Found" });
        }
        // const cacheKeys = ['allProductsAdmin', 'allProducts'];
        // cacheKeys.forEach(key => productCache.del(key));

        res.status(200).json({
            success: true,
            message: "isPublished updated successfully"
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}; ///////admin

exports.productFilter = async (req, res) => {
    try {
        const { startingPrice, endingPrice, name, category, brand, isDeleted } = req.body;
        const user_id = req.user.id;
        let matchStage = {
            isDeleted: false
        };
        if (startingPrice !== undefined) {
            const startPriceNum = Number(startingPrice);
            if (isNaN(startPriceNum)) {
                return res.status(400).json({ status: false, message: "Invalid starting price" });
            }
            matchStage.saleprice = { $gte: startPriceNum };
        }
        if (endingPrice !== undefined) {
            const endPriceNum = Number(endingPrice);
            if (isNaN(endPriceNum)) {
                return res.status(400).json({ status: false, message: "Invalid ending price" });
            }
            if (matchStage.saleprice) {
                matchStage.saleprice.$lte = endPriceNum;
            } else {
                matchStage.saleprice = { $lte: endPriceNum };
            }
        }
        if (category !== undefined) {
            if (!mongoose.isValidObjectId(category)) {
                return res.status(400).json({ status: false, message: "Invalid category id!" });
            }
            matchStage.category = new mongoose.Types.ObjectId(category);
        }
        if (brand !== undefined) {
            if (!mongoose.isValidObjectId(brand)) {
                return res.status(400).json({ status: false, message: "Invalid brand id!" });
            }
            matchStage.brand = new mongoose.Types.ObjectId(brand);
        }
        if (isDeleted !== undefined) {
            matchStage.isDeleted = Boolean(isDeleted);
        }
        if (name !== undefined) {
            matchStage.name = { $regex: new RegExp(name, 'i') };
        }
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'imgurls',
                    localField: 'image',
                    foreignField: '_id',
                    as: 'image'
                }
            },
            { $unwind: { path: '$image', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'brands',
                    localField: 'brand',
                    foreignField: '_id',
                    as: 'brand'
                }
            },
            { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } }
        ];
        const products = await Product.aggregate(pipeline)
        if (user_id) {
            const wish = await WhistList.findOne({ user_id: user_id });
            if (wish) {
                const wishProductIds = wish.products.map(product => product.product_id.toString());
                products.forEach(product => {
                    product.isWishList = wishProductIds.includes(product._id.toString());
                });
            }
        }
        return res.status(200).json({
            status: true,
            total: products.length,
            product: products
        });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
}; //// user
