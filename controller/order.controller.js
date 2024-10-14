const Addresses = require("../model/addresses.model")
const AddToCart = require("../model/addToCart.model")
const Order = require("../model/order.model")
const Product = require("../model/product.model")
const ShippingCharge = require("../model/shiping.model")
const mongoose = require('mongoose');
const State = require("../model/state.model")
const CheckOut = require("../model/checkout.model")
const razorpay = require("../utils/razorpay")
const crypto = require('crypto');
const Request = require("../model/request.model")
const User = require("../model/user.model")
const Category = require("../model/category.model")
const sendOrderConfirmationEmail = require("../utils/order-summary")

exports.createShiping = async (req, res) => {
    const { state, charges, kg } = req.body
    if (!state || !charges || !kg) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }
    try {
        const stateId = await State.findById(state);
        if (!stateId) {
            return res.status(404).json({ message: 'State not found' });
        }
        if (stateId.isPublished === false) {
            return res.status(400).json({ message: 'This state does not have access' });
        }
        const shiping = await ShippingCharge.create({ 
            state, 
            charges,
            kg
        })
        if (!shiping) {
            return res.status(400).json({ success: false, message: "Something went wrong" })
        }
        res.status(201).json({ success: true, message: "Shiping charge created successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

exports.getShiping = async (req, res) => {
    try {
        const shiping = await ShippingCharge.find()
        if (!shiping) {
            return res.status(400).json({ success: false, message: "Something went wrong" })
        }
        res.status(200).json({ success: true, shiping })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}


///////////////////// check out //////////////////
// exports.proceedToCheckout = async (req, res) => {
//     const { address_id } = req.body;

//     try {
//         if (!mongoose.isValidObjectId(address_id)) {
//             return res.status(400).json({ status: false, message: "Invalid address_id!" });
//         }

//         const address = await Addresses.findOne({ _id: address_id, userId: req.user._id }).populate('state');
//         if (!address) {
//             return res.status(404).json({ status: false, message: "Address not found!" });
//         }

//         const cart = await AddToCart.findOne({ userId: req.user._id });
//         if (!cart || !cart.products.length) {
//             return res.status(400).json({ status: false, message: "Cart is empty!" });
//         }

//         let totalPrice = 0;
//         let totalGst = 0;
//         let totalWeight = 0;

//         for (const item of cart.products) {
//             const { productId, quantity, productPrice } = item;

//             const product = await Product.findById(productId);
//             if (!product) {
//                 return res.status(404).json({ status: false, message: `Product not found for productId: ${productId}` });
//             }

//             if (quantity > product.stock) {
//                 return res.status(400).json({ status: false, message: `Insufficient stock for productId: ${productId}` });
//             }

//             const itemPrice = productPrice || product.saleprice;
//             totalPrice += itemPrice * quantity;

//             if (product.tax && product.tax.include) {
//                 const productGstRate = product.tax.gst || 0;
//                 totalGst += (itemPrice * quantity * productGstRate) / 100;
//             }

//             totalWeight += (product.weight || 0) * quantity;
//         }

//         const stateId = address.state._id;
//         const shippingChargeDoc = await ShippingCharge.findOne({ state: stateId }).exec();
//         if (!shippingChargeDoc) {
//             return res.status(404).json({ status: false, message: "Shipping charge not found for state!" });
//         }

//         const { charges, kg } = shippingChargeDoc;
//         if (kg <= 0) {
//             return res.status(400).json({ status: false, message: "Invalid shipping weight configuration!" });
//         }

//         const chargeableWeight = Math.ceil(totalWeight / kg);
//         const shippingCharge = chargeableWeight * charges;

//         const calculatedTotalPrice = totalPrice + shippingCharge + totalGst;

//         return res.status(200).json({
//             status: true,
//             checkoutDetails: {
//                 user_id: req.user._id,
//                 address_id,
//                 order_Item: cart.products.map(item => ({
//                     product_id: item.productId,
//                     quantity: item.quantity,
//                     price: item.productPrice || null
//                 })),
//                 shippingCharge,
//                 gst: totalGst,
//                 totalPrice: calculatedTotalPrice
//             }
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ status: false, message: "Internal Server Error" });
//     }
// };


///////////////comform order (user)////////////////

// exports.checkout = async (req, res) => {
//     const { address_id, payment_method } = req.body;

//     try {
//         if (!mongoose.isValidObjectId(address_id)) {
//             return res.status(400).json({ status: false, message: "Invalid address_id!" });
//         }

//         const address = await Addresses.findOne({ _id: address_id, userId: req.user._id }).populate('state');
//         if (!address) {
//             return res.status(404).json({ status: false, message: "Address not found!" });
//         }

//         const cart = await AddToCart.findOne({ userId: req.user._id });
//         if (!cart || !cart.products.length) {
//             return res.status(400).json({ status: false, message: "Cart is empty!" });
//         }

//         let totalPrice = 0;
//         let totalGst = 0;
//         let totalWeight = 0;

//         for (const item of cart.products) {
//             const { productId, quantity, productPrice } = item;

//             if (!mongoose.isValidObjectId(productId)) {
//                 return res.status(400).json({ status: false, message: `Invalid productId: ${productId}` });
//             }

//             if (typeof quantity !== 'number' || quantity <= 0) {
//                 return res.status(400).json({ status: false, message: `Invalid quantity for productId: ${productId}` });
//             }

//             const product = await Product.findById(productId);
//             if (!product) {
//                 return res.status(404).json({ status: false, message: `Product not found for productId: ${productId}` });
//             }

//             if (quantity > product.stock) {
//                 return res.status(400).json({ status: false, message: `Insufficient stock for productId: ${productId}` });
//             }

//             const itemPrice = productPrice || product.saleprice;
//             totalPrice += itemPrice * quantity;

//             // Calculate GST for this item if tax.include is true
//             if (product.tax && product.tax.include) {
//                 const productGstRate = product.tax.gst || 0;
//                 totalGst += (itemPrice * quantity * productGstRate) / 100;
//             }

//             // Calculate total weight
//             totalWeight += (product.weight || 0) * quantity; // Assuming 'weight' is in kg
//         }

//         // Get state ID from address
//         const stateId = address.state._id;

//         // Fetch the shipping charge for the state
//         const shippingChargeDoc = await ShippingCharge.findOne({ state: stateId }).exec();
//         if (!shippingChargeDoc) {
//             return res.status(404).json({ status: false, message: "Shipping charge not found for state!" });
//         }

//         const { charges, kg } = shippingChargeDoc;
//         if (kg <= 0) {
//             return res.status(400).json({ status: false, message: "Invalid shipping weight configuration!" });
//         }

//         const chargeableWeight = Math.ceil(totalWeight / kg);
//         const shippingCharge = chargeableWeight * charges;

//         // Calculate final total price including shipping and GST
//         const calculatedTotalPrice = totalPrice + shippingCharge + totalGst;

//         // Ensure calculated prices are valid numbers
//         if (isNaN(shippingCharge) || isNaN(calculatedTotalPrice)) {
//             return res.status(500).json({ status: false, message: "Error in calculation of shipping or total price!" });
//         }

//         // Create the order
//         const checkout = new CheckOut({
//             user_id: req.user._id,
//             address_id,
//             cart_id: cart._id, 
//             payment_method,
//             shipping_Charge: shippingCharge,
//             gst: totalGst,
//             totalPrice: calculatedTotalPrice
//         });

//         const savedCheckout = await checkout.save();

//         if(!savedCheckout) {
//             return res.status(500).json({ status: false, message: "Error in saving checkout!" });
//         }
//         return res.status(200).json({ status: true, data: savedCheckout });

//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Internal Server Error" });
//     }
// };

exports.checkout = async (req, res) => {
    const { address_id, payment_method } = req.body;

    try {
        // Find and validate cart
        const cart = await AddToCart.findOne({ userId: req.user._id });
        if (!cart || !cart.products.length) {
            return res.status(400).json({ status: false, message: "Cart is empty!" });
        }

        // Validate address_id
        if (!mongoose.isValidObjectId(address_id)) {
            return res.status(400).json({ status: false, message: "Invalid address_id!" });
        }

        // Find and validate address in user's address array
        const userAddress = await Addresses.findOne({ userId: req.user._id });
        if (!userAddress) {
            return res.status(404).json({ status: false, message: "User addresses not found!" });
        }

        const address = userAddress.address.id(address_id);
        if (!address) {
            return res.status(404).json({ status: false, message: "Address not found!" });
        }

        let totalPrice = 0;
        let totalGst = 0;
        let totalWeight = 0;

        // Calculate total price, GST, and weight
        for (const item of cart.products) {
            const { productId, quantity, productPrice } = item;

            // Validate productId and quantity
            if (!mongoose.isValidObjectId(productId)) {
                return res.status(400).json({ status: false, message: `Invalid productId: ${productId}` });
            }

            if (typeof quantity !== 'number' || quantity <= 0) {
                return res.status(400).json({ status: false, message: `Invalid quantity for productId: ${productId}` });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ status: false, message: `Product not found for productId: ${productId}` });
            }

            if (quantity > product.stock) {
                return res.status(400).json({ status: false, message: `Insufficient stock for productId: ${productId}` });
            }

            const itemPrice = productPrice || product.saleprice;
            totalPrice += itemPrice * quantity;

            // Calculate GST for this item if tax.include is true
            if (product.tax && product.tax.include) {
                const productGstRate = product.tax.gst || 0;
                totalGst += (itemPrice * quantity * productGstRate) / 100;
            }

            // Calculate total weight
            totalWeight += (product.weight || 0) * quantity; // Assuming 'weight' is in kg
        }

        // Fetch shipping charge for the state
        const stateId = address.state._id;
        const shippingChargeDoc = await ShippingCharge.findOne({ state: stateId }).exec();
        if (!shippingChargeDoc) {
            return res.status(404).json({ status: false, message: "Shipping charge not found for state!" });
        }

        const { charges, kg } = shippingChargeDoc;
        if (kg <= 0) {
            return res.status(400).json({ status: false, message: "Invalid shipping weight configuration!" });
        }

        const chargeableWeight = Math.ceil(totalWeight / kg);
        const shippingCharge = chargeableWeight * charges;

        // Calculate final total price including shipping and GST
        const calculatedTotalPrice = totalPrice + shippingCharge + totalGst;

        // Ensure calculated prices are valid numbers
        if (isNaN(shippingCharge) || isNaN(calculatedTotalPrice)) {
            return res.status(500).json({ status: false, message: "Error in calculation of shipping or total price!" });
        }

        // Check for existing checkout
        const existingCheckout = await CheckOut.findOne({ user_id: req.user._id });
        if (existingCheckout) {
            existingCheckout.address_id = address_id;
            existingCheckout.payment_method = payment_method;
            existingCheckout.shipping_Charge = shippingCharge;
            existingCheckout.gst = totalGst;
            existingCheckout.totalPrice = calculatedTotalPrice;
            existingCheckout.cart_item = cart.products.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                price: item.productPrice
            }));

            const updatedCheckout = await existingCheckout.save();
            if (!updatedCheckout) {
                return res.status(500).json({ status: false, message: "Error in updating checkout!" });
            }
            console.log("hi");
            await sendOrderConfirmationEmail(req.user.email_id, updatedCheckout);
            return res.status(200).json({ status: true, data: updatedCheckout });
        } else {
            const checkout = new CheckOut({
                user_id: req.user._id,
                address_id,
                payment_method,
                shipping_Charge: shippingCharge,
                gst: totalGst,
                totalPrice: calculatedTotalPrice,
                cart_item: cart.products.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    price: item.productPrice
                }))
            });


            const savedCheckout = await checkout.save();
            console.log("hi");
            await sendOrderConfirmationEmail({email: req.user.email_id,checkout: savedCheckout});
            
            if (!savedCheckout) {
                return res.status(500).json({ status: false, message: "Error in saving checkout!" });
            }

            return res.status(200).json({ status: true, data: savedCheckout });
        }

    } catch (error) {
        console.error(error); // Log error for debugging
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


// Create payment and verify
exports.razorpay = async (req, res) => {
    const userId = req.user._id; // Assuming user ID is stored in req.user

    try {
        const checkOut = await CheckOut.findOne({ user_id: userId });
        
        if (!checkOut || checkOut.cart_item.length === 0) {
            return res.status(404).json({ success: false, message: 'Checkout not found or cart is empty' });
        }

        console.log(checkOut.payment_method !== 'RAZARPAY')
        if (checkOut.payment_method !== 'RAZARPAY') {
            return res.status(400).json({ success: false, message: 'Payment method is not Razorpay' });
        }
        
        const options = {
            amount: checkOut.totalPrice * 100, 
            currency: 'INR',
            receipt: `receipt_${checkOut._id}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        // Handle and return error
        res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
    }
};


exports.razorpayVerify = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    if (generatedSignature === signature) {
        const checkOut = await CheckOut.findOne({ cart_id: orderId , user_id: req.user._id }); 

        if (!checkOut) {
            return res.status(404).json({ success: false, message: 'Checkout not found' });
        }

        const order = new Order({
            user_id: checkOut.user_id,
            address_id: checkOut.address_id,
            order_item: checkOut.cart_id.products.map(p => ({
                product_id: p.productId._id,
                quantity: p.quantity,
                price: p.productPrice,
            })),
            order_code: `ORD-${Date.now()}`,
            order_status: 'pending',
            payment: 'RAZARPAY',
            payment_id: paymentId,
            payment_status: 'paid',
            isPaymentSuccess: true,
            shipping_charge: checkOut.shipping_Charge,
            gst: checkOut.gst,
            totalPrice: checkOut.totalPrice,
        });

        await order.save();

        // Send confirmation email
        // res.redirect(
        //     `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
        // );
        res.status(200).json({ success: true, message: 'Payment verified and order created' });
    } else {
        res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
}


// exports.requestUpdate = catchAsyncError(async (req, res, next) => {
//     const {type, note, status, proof_image} = req.body;
    
//     const userUpdate = await Request.findByIdAndUpdate(req.params.id,{ status,type,note,proof_image },{ new:true })
//     if (userUpdate.type === 'product') {
//         if(status === 'comnpleted'){
//             await AddToCart.findByIdAndUpdate(userUpdate.addToCart_id, { $pull: { products: { _id: userUpdate.addToCart_item_id } } });
//         }
//     }else if(userUpdate.type === 'addToCart'){
//         if(status === 'comnpleted'){
//             await AddToCart.findByIdAndDelete(userUpdate.addToCart_id)
//         }
//     }else {
//         return res.status(400).json({ success: false, message: 'This Type Is Not Awlebale' });
//     }
    
//     res.status(200).json({
//         success:true,
//         userUpdate
//     })
// })


// exports.getUserReturnRequests = async (req, res) => {
//     const userId = req.user._id; // Assuming user ID is stored in req.user

//     try {
//         const returnRequests = await ReturnRequest.find({ user_id: userId }).populate('order_id', 'order_code'); // Populate order details if needed
//         return res.status(200).json({ success: true, data: returnRequests });
//     } catch (error) {
//         console.error('Error fetching return requests:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };



exports.requestCreate = async (req, res, next) => {
    const userId = req.user.id; 
    const { order_id, type, order_item_id, note, reason, status, proof_image } = req.body;

    try {
        if (!order_id) {
            return res.status(400).json({ success: false, message: 'Order ID is required' });
        }

        const order = await Order.findById(order_id);
 
        if (!order || order.user_id.toString() !== userId) {
            return res.status(404).json({ success: false, message: 'Order not found or does not belong to the user' });
        }


        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        

        if (order.createdAt.getTime() < sevenDaysAgo.getTime()) {
            return res.status(400).json({ success: false, message: 'Return request cannot be made for orders older than 7 days' });
        }

        const existingRequest = await Request.findOne({ 
            type: type, 
            user_id: userId, 
            order_id: order_id, 
            order_item_id: order_item_id 
        });
        if (existingRequest) {
            return res.status(400).json({ success: false, message: 'A return request for this order item already exists' });
        }

        let refund_amount = 0;

        if (type === 'product') {
            if (!order_item_id) {
                return res.status(400).json({ success: false, message: 'Order item ID is required when type is "product"' });
            }

            const orderItem = order.order_item.find(item => item._id.toString() === order_item_id);
            if (!orderItem) {
                return res.status(400).json({ success: false, message: 'Order item not found in the order' });
            }

            refund_amount = orderItem.price;
        } else if (type === 'order') {
            refund_amount = order.totalPrice;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }
       
        const newRequest = await Request.create({
            user_id: userId,
            order_id,
            type,
            refund_amount, 
            order_item_id,
            note,
            reason,
            status,
            proof_image
        });
        if (!newRequest) {
            return res.status(500).json({ success: false, message: 'Failed to create return request' });
        }
        return res.status(201).json({ success: true, message: 'Return request created successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateRequest = async (req, res) => {
    const { request_id, status, refundedDate } = req.body;

    try {
        const request = await Request.findById(request_id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found or does not belong to the user' });
        }
       
        request.status = status || request.status;
        if (status === 'refunded') {
            request.refundedDate = refundedDate || new Date();
        }

        const updatedRequest = await request.save();
        return res.status(200).json({ success: true, message: 'Return request updated successfully', data: updatedRequest });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.totalOrder = async (req, res) => {
    try {
        const total = await Order.find();
        return res.status(200).json({ status: true, total: total.length });
    } catch (error) {      
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};

