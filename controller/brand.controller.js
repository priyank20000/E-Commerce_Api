const Brand = require("../model/brand.model");
const Category = require("../model/category.model");
const ImgUrl = require("../model/media.model");
const ExcelJS = require('exceljs');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
/////////////////////////// create brand (admin) ///////////////
exports.brandCreate = async(req, res, next) => {
    const { name, description, logo } = req.body;
    const validation = { name, description, logo };
    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(400).json({ success: false, message: `${missingField} is missing` });
    }
    try {
        const logoData = await ImgUrl.findById(logo).exec();
        if (!logoData) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid logo ID"
            });
        }
        const newBrand = await Brand.create({
            name,
            description,
            logo
        });
        if (!newBrand) {
            return res.status(400).json({ success: false, message: "Brand Not Found" });
        }
        return res.status(200).json({ success: true, message: "Brand Add SuccessFully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////// delet brand (admin) ////////////////////////
exports.deleteBrand = async (req, res, next) => {
    try {
        const brandId = req.body.id;
        if (!brandId) {
            return res.status(400).json({ success: false, message: "Brand ID is required in the request body" });
        }
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        const deletedBrand = await Brand.findByIdAndDelete(brandId);
        if (deletedBrand) {
            return res.status(200).json({ success: true, message: "Brand deleted successfully" });
        } else {
            return res.status(500).json({ success: false, message: "Error deleting brand" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////////// update brand (admin) ////////////////
exports.updateBrand = async(req, res, next) => {
    const {name, description} =req.body
    try {
        const updateBrand = await Brand.findByIdAndUpdate(req.body.id, {name,description},{new:true})
        if(updateBrand){
            res.status(200).json({success:true ,message:"Brand Update SuccessFully"})
        }else{
            res.status(400).json({success:false ,message:"Brand Not Found"})
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

/////////////// get all brand (user) ////////////

exports.getAllBrand = async(req, res, next) => {
    try{
        const BrandId = await Brand.find()
        if(BrandId){
            res.status(200).json({success: true, BrandId})
        }else{
            res.status(400).json({success:false, message:"Brand Id Does'n't Find"})
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

/////////////////// get brand (user) //////////

exports.getBrand = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.body.id); 
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found" });
        }
        return res.status(200).json({ success: true, data: brand });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


//////////////////////////////////////////////////////////////////////
exports.downloadXlsxBrandFile = async (req, res, next) => {
    try {
        // { name,slug, description }
      
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const brands = await Brand.find()
            .populate('logo')
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Brands');
        
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Logo', key: 'logo', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 30 },
            { header: 'Updated At', key: 'updatedAt', width: 30 },
            { header: '__v', key: '__v', width: 10 }
        ];
        for (const brand of brands) {
            
            let logoUrl = '';
            if (brand.logo && brand.logo.url) {
                logoUrl = brand.logo.url.startsWith('http') ? brand.logo.url : baseUrl + brand.logo.url;
            }

            const logoField = brand.logo ? [{ _id: brand.logo._id.toString(), url: logoUrl }] : [];
            

            await worksheet.addRow({
                name: brand.name,
                logo: JSON.stringify(logoField),
                description: brand.description,
                createdAt: brand.createdAt.toLocaleString(), 
                updatedAt: brand.updatedAt.toLocaleString(),
                __v: brand.__v
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Brand.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error downloading Brand:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 

///////////////////////////////////////////////////////
exports.uploadXlsxBrandFile = async (req, res) => {
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
exports.downloadJsonBrandFile = async (req, res) => {
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
exports.uploadJsonvBrandFile = async (req, res) => {
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

