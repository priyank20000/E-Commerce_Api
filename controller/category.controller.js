const Category = require("../model/category.model");
const Product = require("../model/product.model");
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const categoryCache = new NodeCache({ stdTTL: 3600 }); 
const { ObjectId } = mongoose.Types;

////////////////////////// create category (admin) ////////////

exports.categoryCreate = async (req, res, next) => {
    const { name, slug, description, parentId } = req.body;

    try {
        const requiredFields = { name, slug, description };
        const missingField = Object.keys(requiredFields).find(key => !requiredFields[key]);

        if (missingField) {
            return res.status(400).json({ success: false, message: `${missingField} is missing` });
        }

        // Sanitize slug
        const sanitizedSlug = slug.replace(/\s+/g, '-').toLowerCase();

        // Create new category
        const newCategory = new Category({
            name,
            slug: sanitizedSlug,
            description,
            parentId,
        });
        
        const savedCategory = await newCategory.save();
      

        // Update parent category's subCategories array
        if (parentId) {
            const parentCategory = await Category.findById(parentId).exec();
            if (parentCategory) {
                parentCategory.subCategories = parentCategory.subCategories || [];
                parentCategory.subCategories.push(savedCategory._id);
                await parentCategory.save();
            } else {
                return res.status(404).json({ success: false, message: "Parent category not found" });
            }
        }
        // Respond with success
        res.status(201).json({ success: true, message: "Category successfully added", data: savedCategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////////// get category (usser) ////////////
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.body.id).populate('subCategories').exec();
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        const populateHierarchy = async (category) => {
            if (category.subCategories && category.subCategories.length > 0) {
                category.subCategories = await Category.populate(category.subCategories, { path: 'subCategories' });
                for (const child of category.subCategories) {
                    if (child.subCategories && child.subCategories.length > 0) {
                        await populateHierarchy(child);
                    }
                }
            }
            return category;
        };
        const populatedCategory = await populateHierarchy(category);
        res.status(200).json({ success: true, data: populatedCategory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////////// get all category (user) ////////////


// exports.getAllCategories = async (req, res, next) => {
//     try {
//         const cacheKey = 'allCategories';
//         const cachedCategories = await categoryCache.get(cacheKey);
//         if (cachedCategories) {
//             return res.status(200).json({
//                 success: true,
//                 products: JSON.parse(cachedCategories)
//             });
//         }
//         const categories = await Category.find({});
//         categoryCache.set(cacheKey, JSON.stringify(categories), 3600);
//         res.status(200).json({ success: true, categories });
//     } catch (error) {
//         console.error("Error fetching categories:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };
// Get all categories with hierarchical structure
exports.getAllCategories = async (req, res) => {
    try {
        // Fetch top-level categories (categories with no parent)
        const topCategories = await Category.find({ parentId: null }).populate('subCategories').exec();

        // Recursive function to populate subCategories and build hierarchy
        const populateHierarchy = async (categories) => {
            // Populate subCategories of the current level
            const populatedCategories = await Category.populate(categories, { path: 'subCategories' });

            // Recursively populate subCategories of each category
            for (const category of populatedCategories) {
                if (category.subCategories && category.subCategories.length > 0) {
                    category.subCategories = await populateHierarchy(category.subCategories);
                }
            }

            return populatedCategories;
        };

        // Build the hierarchical structure
        const hierarchy = await populateHierarchy(topCategories);

        res.status(200).json({ success: true, data: hierarchy });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


////////////////////////// delet category (admin) ////////////

exports.deleteCategory = async (req, res, next) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.body.id);
        if (!deletedCategory) {
            return res.status(200).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({ success: true, message: "Category deleted successfully", deletedCategory });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

//////////////////////////////////////////////////////////////////////////
exports.downloadXlsxCategoryFile = async (req, res, next) => {
    try {
        // { name,slug, description }
      
        
        const categorys = await Category.find();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Categorys');
        
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Slug', key: 'slug', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 30 },
            { header: 'Updated At', key: 'updatedAt', width: 30 },
            { header: '__v', key: '__v', width: 10 }
        ];
        for (const category of categorys) {
            
            await worksheet.addRow({
                name: category.name,
                slug: category.slug,
                description: category.description,
                createdAt: category.createdAt.toLocaleString(),
                updatedAt: category.updatedAt.toLocaleString(),
                __v: category.__v
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=category.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error downloading category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 




///////////////////////////////////////// xlsx to json upload in db
exports.uploadXlsxCategoryFile = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const workbook = new ExcelJS.Workbook();
        const buffer = req.files.file.data; // Access the buffer containing the XLSX file data

        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet('Categorys');
        if (!worksheet) {
            return res.status(400).json({ success: false, message: 'Invalid Excel file format: Missing "Categorys" worksheet' });
        }

        const categories = [];

        // Async function to check if ObjectId exists in database
        const objectIdExists = async (id, model) => {
            try {
                const doc = await model.findById(id);
                return !!doc;
            } catch (error) {
                return false;
            }
        };

        // Iterate through each row
        for (let rowNumber = 2; rowNumber <= worksheet.actualRowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);

            const name = row.getCell(1).value;
            const slug = row.getCell(2).value;
            const description = row.getCell(3).value;
            // const imageId = row.getCell(4).value; // Assuming it's ObjectId or String for reference

            // // Validate ObjectId format and existence for image
            // const isValidImage = await objectIdExists(imageId, ImgUrl);
            // if (!isValidImage) {
            //     return res.status(400).json({
            //         success: false,
            //         message: `Object with id ${imageId} not found in ImgUrl`
            //     });
            // }

            // const featuredCategory = row.getCell(5).value;
            // const createdAt = new Date(row.getCell(6).value); // Assuming it's a Date in Excel format
            // const updatedAt = new Date(row.getCell(7).value); // Assuming it's a Date in Excel format

            const categoryData = {
                name: name,
                slug: slug,
                description: description
                // image: new ObjectId(imageId), // Convert to ObjectId if needed
                // featuredCategory: featuredCategory,
                // createdAt: createdAt,
                // updatedAt: updatedAt
            };

            categories.push(categoryData);
        }

        // Save categories to database using insertMany
        await Category.insertMany(categories);

        res.status(200).json({ success: true, message: 'Categories added successfully' });
    } catch (error) {
        console.error('Error uploading categories file:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

/////////////////////////////////
exports.downloadJsonCategoryFile = async (req, res) => {
    try {
        const categories = await Category.find({}, { _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });

        if (!categories || categories.length === 0) {
            return res.status(404).json({ success: false, message: 'No categories found' });
        }

        const categoriesJson = JSON.stringify(categories, null, 2);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=categories.json');

        res.send(categoriesJson);
    } catch (error) {
        console.error('Error downloading categories JSON:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//////////////////////
exports.uploadJsoncategorysFile = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const jsonData = JSON.parse(req.files.file.data.toString());

        const categorys = [];

        

        for (let i = 0; i < jsonData.length; i++) {
            const data = jsonData[i];

            const productData = {
                name: data.name,
                slug: data.slug,
                description: data.description,
                
            };

            categorys.push(productData);
        }

        // Save categorys to database using insertMany
        await Category.insertMany(categorys);

        res.status(200).json({ success: true, message: 'categorys added successfully' });
    } catch (error) {
        console.error('Error uploading categorys file:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

