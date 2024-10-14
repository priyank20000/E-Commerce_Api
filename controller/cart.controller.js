const AddToCart = require("../model/addToCart.model");
const BoughtFrequently = require("../model/boughtFrequently");
const Coupon = require("../model/coupon.model");
const Product = require("../model/product.model");

// exports.addToCart = async (req, res) => {
//     try {
//         const { productId, quantity, couponcode } = req.body;

//         if (!productId || !quantity) {
//             return res.status(400).json({ success: false, message: "Product ID and quantity are required" });
//         }
//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).json({ status: false, message: "Product not found" });
//         }

//         // Handle coupon if provided
//         let couponId;
//         if (couponcode) {
//             const coupon = await Coupon.findOne({ code: couponcode });
//             if (!coupon) {
//                 return res.status(404).json({ status: false, message: "Coupon not found" });
//             }
//             couponId = coupon._id;
//         }

//         // Determine if the user is authenticated or a guest
//         const userId = req.user ? req.user.id : req.guestId;
//         if (!userId) {
//             return res.status(400).json({ status: false, message: "User or guest ID not found" });
//         }

//         // Check existing cart
//         let existingCart = await AddToCart.findOne({ userId });
//         if (existingCart) {
//             // Cart exists, update it
//             const existingProduct = existingCart.products.find(item => item.productId.toString() === productId);

//             if (existingProduct) {
//                 // Update existing product quantity and price
//                 existingProduct.quantity += quantity;

//                 // Validate stock
//                 if (product.stock < existingProduct.quantity) {
//                     return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock" });
//                 }
//                 // If quantity is zero or less, remove the product
//                 if (existingProduct.quantity <= 0) {
//                     existingCart.products = existingCart.products.filter(item => item.productId.toString() !== productId);

//                     // If the cart is empty after removal, delete the cart
//                     if (existingCart.products.length <= 0) {
//                         await AddToCart.deleteOne({ userId });
//                         return res.status(200).json({ status: true, message: "Cart is empty and removed" });
//                     }
//                 } else {
//                     // Recalculate the product price based on the updated quantity
//                     existingProduct.productPrice = product.saleprice * existingProduct.quantity;
//                 }

//                 // Recalculate the total price of the cart
//                 existingCart.TotalPrice = existingCart.products.reduce((total, item) => total + item.productPrice, 0);

//                 await existingCart.save();
//                 return res.status(200).json({ status: true, message: "Cart updated successfully", existingCart });
//             } else {
//                 if (product.stock < quantity) {
//                     return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock" });
//                 }
//                 // Add new product to cart
//                 if (quantity <= 0) {
//                     return res.status(400).json({ status: false, message: "Quantity must be greater than zero to add a product" });
//                 }

//                 existingCart.products.push({
//                     productId,
//                     quantity,
//                     productPrice: product.saleprice * quantity
//                 });

//                 // Update the total price of the cart
//                 existingCart.TotalPrice += product.saleprice * quantity;
//                 await existingCart.save();
//                 return res.status(200).json({ status: true, message: "Product added to cart successfully", existingCart });
//             }
//         } else {
//             if (product.stock < quantity) {
//                 return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock" });
//             }
            
//             // Create a new cart
//             if (quantity <= 0) {
//                 return res.status(400).json({ status: false, message: "Quantity must be greater than zero to create a new cart" });
//             }

//             const newCart = await AddToCart.create({
//                 userId,
//                 products: [{
//                     productId,
//                     quantity,
//                     productPrice: product.saleprice * quantity
//                 }],
//                 couponId,
//                 TotalPrice: product.saleprice * quantity
//             });

//             if (newCart) {
//                 return res.status(200).json({ status: true, message: "Product added to new cart successfully", newCart });
//             } else {
//                 return res.status(500).json({ status: false, message: "Error adding product to new cart" });
//             }
//         }
//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Server error", error: error.message });
//     }
// };



exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, couponcode, boughtFrequentlyId } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ success: false, message: "Product ID and quantity are required." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: false, message: "Product not found." });
        }

        let couponId;
        if (couponcode) {
            const coupon = await Coupon.findOne({ code: couponcode });
            if (!coupon) {
                return res.status(404).json({ status: false, message: "Coupon not found." });
            }
            couponId = coupon._id;
        }

        const userId = req.user ? req.user.id : req.guestId;
        if (!userId) {
            return res.status(400).json({ status: false, message: "User or guest ID not found." });
        }

        let existingCart = await AddToCart.findOne({ userId });

        if (boughtFrequentlyId) {
            if (!product.boughtFrequently || product.boughtFrequently.toString() !== boughtFrequentlyId) {
                return res.status(400).json({ status: false, message: "BoughtFrequently ID does not match the product's Bought Frequently." });
            }

            const boughtFrequently = await BoughtFrequently.findById(boughtFrequentlyId);
            if (!boughtFrequently) {
                return res.status(404).json({ status: false, message: "BoughtFrequently record not found." });
            }

            const acceptedProducts = boughtFrequently.products.filter(item => item.isAccepted);
            if (acceptedProducts.length === 0) {
                return res.status(400).json({ status: false, message: "No accepted products found." });
            }

            const existingProducts = existingCart ? existingCart.products.map(item => item.productId.toString()) : [];

            const newProducts = await Promise.all(acceptedProducts.map(async item => {
                const prod = await Product.findById(item.productId);
                if (!prod) return res.status(404).json({ status: false, message: "Product not found." }); 

                if (!existingProducts.includes(item.productId.toString())) {
                    const addQuantity = item.quantity || 1;
                    return {
                        productId: item.productId,
                        quantity: addQuantity,
                        productPrice: prod.saleprice * addQuantity
                    };
                }
                // return res.status(400).json({ status: false, message: "All accepted products from Bought Frequently are already in the cart." });
            }));

            const filteredNewProducts = newProducts.filter(Boolean); 

            if (filteredNewProducts.length === 0) {
                return res.status(400).json({ status: false, message: "All accepted products from Bought Frequently are already in the cart." });
            }

            if (existingCart) {
                existingCart.products.push(...filteredNewProducts);
            } else {
                existingCart = await AddToCart.create({
                    userId,
                    products: filteredNewProducts,
                    couponId,
                    TotalPrice: filteredNewProducts.reduce((total, item) => total + item.productPrice, 0)
                });
            }

            if (existingCart) {
                existingCart.TotalPrice = existingCart.products.reduce((total, item) => total + item.productPrice, 0);
                await existingCart.save();
                return res.status(200).json({ status: true, message: "Accepted products added to cart from Bought Frequently.", existingCart });
            }
        }

        if (existingCart) {
            const existingProduct = existingCart.products.find(item => item.productId.toString() === productId);

            if (existingProduct) {
                existingProduct.quantity += quantity;

                if (product.stock < existingProduct.quantity) {
                    return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock." });
                }

                if (existingProduct.quantity <= 0) {
                    existingCart.products = existingCart.products.filter(item => item.productId.toString() !== productId);

                    if (existingCart.products.length <= 0) {
                        await AddToCart.deleteOne({ userId });
                        return res.status(200).json({ status: true, message: "Cart is empty and removed." });
                    }
                } else {
                    existingProduct.productPrice = product.saleprice * existingProduct.quantity;
                }

                existingCart.TotalPrice = existingCart.products.reduce((total, item) => total + item.productPrice, 0);
                await existingCart.save();
                return res.status(200).json({ status: true, message: "Cart updated successfully.", existingCart });
            } else {
                if (product.stock < quantity) {
                    return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock." });
                }

                if (quantity <= 0) {
                    return res.status(400).json({ status: false, message: "Quantity must be greater than zero to add a product." });
                }

                existingCart.products.push({
                    productId,
                    quantity,
                    productPrice: product.saleprice * quantity
                });

                existingCart.TotalPrice += product.saleprice * quantity;
                await existingCart.save();
                return res.status(200).json({ status: true, message: "Product added to cart successfully.", existingCart });
            }
        } else {
            if (product.stock < quantity) {
                return res.status(400).json({ status: false, message: "Requested quantity exceeds available stock." });
            }

            if (quantity <= 0) {
                return res.status(400).json({ status: false, message: "Quantity must be greater than zero to create a new cart." });
            }

            const newCart = await AddToCart.create({
                userId,
                products: [{
                    productId,
                    quantity,
                    productPrice: product.saleprice * quantity
                }],
                couponId,
                TotalPrice: product.saleprice * quantity
            });

            if (newCart) {
                return res.status(200).json({ status: true, message: "Product added to new cart successfully.", newCart });
            } else {
                return res.status(500).json({ status: false, message: "Error adding product to new cart." });
            }
        }
    } catch (error) {
        return res.status(500).json({ status: false, message: "Server error.", error: error.message });
    }
};

exports.getAllCart = async (req, res, next) => {
    try{
        const user = await AddToCart.find({ userId: req.user ? req.user.id : req.guestId }).populate('products.productId');
        if(!user){
            res.status(200).json({success:false, message:"cart not found"})
        }
        res.status(200).json({
            success: true,
            user
        });
    }catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}  

exports.removeCart = async (req, res, next) => {
    const { productId } = req.body;
    try {
        let cart = await AddToCart.findOne({ userId: req.user ? req.user.id : req.guestId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "cart not found" });
        }
        const existingProductIndex = cart.products.findIndex(item => item.productId.toString() === productId);
        if (existingProductIndex === -1) {
            return res.status(400).json({ success: false, message: "Product is not in cart" });
        }
        cart.products.splice(existingProductIndex, 1);
        await cart.save();
        res.status(200).json({ success: true, message: "Product removed from cart successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};