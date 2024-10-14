const Product = require("../model/product.model");
const WhistList = require("../model/wishlist.model");

///////////////////////////add wishlist 
exports.addWishlist = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user ? req.user.id : req.guestId;
    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
    };
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }
        let userWishlist = await WhistList.findOne({ userId });
        if (!userWishlist) {
            userWishlist = await WhistList.create({
                userId,
                products: [{ productId }],
                createdDate: new Date()
            });
        } else {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found!" });
            }
            const productInWishlist = userWishlist.products.find(item => item.productId.toString() === productId);
            if (productInWishlist) {
                return res.status(400).json({ success: false, message: "Product already added!" });
            };
            userWishlist.products.push({ productId });
            userWishlist.updatedDate = new Date();
            await userWishlist.save();
        }
        await Product.findByIdAndUpdate(productId, { isInWishlist: true });
        return res.status(200).json({ success: true, message: "Product added successfully to wishlist" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

///////////////////////////remove wishlist
exports.removeWishList = async (req, res, next) => {
    const { productId } = req.body;
    try {
        let wishlist = await WhistList.findOne({ userId: req.user ? req.user.id : req.guestId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: "Wishlist not found" });
        }
        const existingProductIndex = wishlist.products.findIndex(item => item.productId.toString() === productId);
        if (existingProductIndex === -1) {
            return res.status(400).json({ success: false, message: "Product is not in wishlist" });
        }
        wishlist.products.splice(existingProductIndex, 1);
        await wishlist.save();
        await Product.findByIdAndUpdate(productId, { isInWishlist: false });
        res.status(200).json({ success: true, message: "Product removed from wishlist successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
///////////////////getAll wishlist
exports.getAllWishList = async (req, res, next) => {
    try{
        const user = await WhistList.find({ userId: req.user ? req.user.id : req.guestId }).populate('products.productId');
        if(!user){
            res.status(200).json({success:false, message:"whistList not found"})
        }
        res.status(200).json({
            success: true,
            user
        });
    }catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}       