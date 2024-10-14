const Product = require("../model/product.model");
const Review = require("../model/reviews.model");

exports.createReview = async (req, res, next) => {
    const { productId,  rating, comment } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product Not Found" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const newReview = await Review.create({
            userId: req.user.id, 
            productId,
            name: req.user.name,
            rating,
            comment
        });

        const totalReviews = product.review.totalReviews + 1;
        const averageRating = (product.review.averageRating * product.review.totalReviews + rating) / totalReviews;

        await Product.findByIdAndUpdate(productId, {
            review: {
                averageRating,
                totalReviews
            }
        }, { new: true });

        res.status(201).json({ success: true, message: "Review added successfully", data: newReview });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}; /////user

exports.reviewFilter = async (req, res, next) => {
    const { productId, rating } = req.body;
    try {
        const filter = {};
        if (productId !== undefined) {
            filter.productId = productId;
        }
        if (rating !== undefined) {
            filter.rating = rating;
        }
        let reviews = await Review.find(filter);
        if (reviews.length === 0) {
            return res.status(404).json({ success: false, message: "No reviews found for the given criteria" });
        }
        let totalRating = 0;
        reviews.forEach(review => {
            totalRating += review.rating;
        });
        const averageRating = totalRating / reviews.length;
        return res.status(200).json({ success: true, averageRating, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; //////user

exports.getReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ isPublished: true }).populate('productId');
        if (reviews.length === 0) {
            return res.status(404).json({ success: false, message: "No reviews found" });
        }
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; ///////user

exports.isPublishedReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.body.id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review Not Found"
            });
        }

        const updatedIsPublished = !review.isPublished;

        const updatedReview = await Review.findByIdAndUpdate(
            review._id,
            { isPublished: updatedIsPublished },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: "Review Not Found" });
        }

        const product = await Product.findById(review.productId);
        if (product) {
            if (updatedIsPublished) {
                const totalReviews = product.review.totalReviews + 1;
                const averageRating = ((product.review.averageRating * product.review.totalReviews) + updatedReview.rating) / totalReviews;

                await Product.findByIdAndUpdate(review.productId, {
                    review: {
                        averageRating,
                        totalReviews
                    }
                }, { new: true });
            } else {
                // If the review is now unpublished, recalculate averages
                const totalReviews = product.review.totalReviews - 1;
                let averageRating = totalReviews > 0
                    ? (product.review.averageRating * product.review.totalReviews - updatedReview.rating) / totalReviews
                    : 0;

                await Product.findByIdAndUpdate(review.productId, {
                    review: {
                        averageRating,
                        totalReviews
                    }
                }, { new: true });
            }
        }

        res.status(200).json({
            success: true,
            message: "isPublished updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; ////admin

exports.getAllReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find();
        if (reviews.length === 0) {
            return res.status(404).json({ success: false, message: "No reviews found" });
        }
        return res.status(200).json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; /////// admin

exports.deleteReview = async (req, res, next) => {
    try {
        const deletedReview = await Review.findByIdAndDelete(req.body.id);
        if (!deletedReview) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        const product = await Product.findById(deletedReview.productId);
        if (product) {
            const totalReviews = product.review.totalReviews - 1;
            const averageRating = totalReviews > 0
                ? (product.review.averageRating * product.review.totalReviews - deletedReview.rating) / totalReviews
                : 0;

            await Product.findByIdAndUpdate(deletedReview.productId, {
                review: {
                    averageRating,
                    totalReviews
                }
            }, { new: true });
        }

        return res.status(200).json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}; //////admin