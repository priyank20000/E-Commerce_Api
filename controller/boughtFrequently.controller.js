const BoughtFrequently = require("../model/boughtFrequently");
const Product = require("../model/product.model");


// exports.createBoughtFrequently = async (req, res, next) => {
//     const { title, products } = req.body;

//     try {
//         const productId = await Product.findById(products[0].productId);
//         if (!productId) {
//             return res.status(404).json({ success: false, message: 'Product not found' });
//         }


//         const newBoughtFrequently = await BoughtFrequently.create({
//             title,
//             products :[{
//                 productId,
//                 discountType,
//                 discount 
//             }]
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// }

exports.createBoughtFrequently = async (req, res) => {
    try {
        const { title, products } = req.body;
        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ status: false, message: "Valid title is required" });
        }
        
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ status: false, message: "Products array is required" });
        }

        const productIds = products.map(p => p.productId);
        const uniqueProductIds = new Set(productIds);
        
        if (uniqueProductIds.size < productIds.length) {
            return res.status(400).json({ status: false, message: "Duplicate product IDs are not allowed" });
        }
        const existingBoughtFrequently = await BoughtFrequently.findOne({ 
            "products.0.productId": products[0].productId 
        });

        if (existingBoughtFrequently) {
            return res.status(400).json({ status: false, message: 'This product is already added' });
        }

        const boughtFrequentlyProducts = await Promise.all(products.map(async (product, i) => {
            if (!product.productId) {
                return res.status(400).json({ status: false, message: "Product ID is required" });
            }

            const existingProduct = await Product.findById(product.productId);
            if (!existingProduct) {
                return res.status(500).json({ status: false, message: `Server error: Product not found for ID ${product.productId}` });
            }

            return {
                productId: existingProduct._id,
                discountType: product.discountType,
                discount: product.discount,
                isAccepted: (i === 0) ? true : (product.isAccepted !== undefined ? product.isAccepted : true)
            };
        }));

        const boughtFrequently = await BoughtFrequently.create({ title, products: boughtFrequentlyProducts });

        await Product.findByIdAndUpdate(products[0].productId, {
            $set: { boughtFrequently: boughtFrequently._id }
        });

        await BoughtFrequently.findByIdAndUpdate(boughtFrequently._id, { $unset: { "products.0.isAccepted": "" } });

        return res.status(201).json({ status: true, message: "Bought Frequently created successfully" });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error"});
    }
};
exports.getBoughtFrequently = async (req, res) => {
    try {
        const boughtFrequently = await BoughtFrequently.find().populate('products.productId');
        return res.status(200).json({ status: true, boughtFrequently });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

exports.isAcceptedBoughtFrequently = async (req, res) => {
    const { id, productIds } = req.body;

    try {
        if (!id || !productIds) {
            return res.status(400).json({ status: false, message: "BoughtFrequently ID and product _id are required" });
        }

        const boughtFrequently = await BoughtFrequently.findById(id);
        if (!boughtFrequently) {
            return res.status(404).json({ status: false, message: "BoughtFrequently not found" });
        }

        const updatedProducts = boughtFrequently.products.map(product => {
            if (product._id.toString() === productIds) {
                product.isAccepted = !product.isAccepted; 
            }
            return product;
        });
        
        boughtFrequently.products = updatedProducts;
        await boughtFrequently.save();

        const filteredProducts = updatedProducts.filter((_, index) => index !== 0);

        return res.status(200).json({
            status: true,
            message: "isAccepted status toggled successfully",
            products: filteredProducts 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};


