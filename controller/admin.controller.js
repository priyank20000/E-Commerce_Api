const Admin = require("../model/admin.model");
const Order = require("../model/order.model");
const Permission = require("../model/permissions.model");
const Permissionname = require("../model/permissionsname.model");
const Role = require("../model/role.model");
const sendToken = require('../utils/jwtToken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
////// admin create //////
exports.adminCreate = async (req, res) => {
    const { username, password } = req.body;
    try {
        let existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'This Admin is already registered' });
        }
        const user = new Admin({
            username,
            password
          });
          await user.save();
        sendToken(user, 200, res, "Register SuccessFully")
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

////// admin loging api //////
exports.adminlogin =  async (req,res,next) =>{
    const { username, password } = req.body;
     const validation = {  username, password  };
    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(200).json({ success: false, message: `${missingField} is missing` });
    }
    try{
        let user = await Admin.findOne({ username });
        let isAdmin = true;
        if(!user){
            user = await Role.findOne({ username }).populate('roles');
            isAdmin = false;
        }
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        sendToken(user, 200, res, "Login successful")
    }catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
} //// admin login pending


//// role create //////
exports.roleCreate = async (req, res) => {
    try {
      const { username, password, roles } = req.body;
      if(!username || !password || !roles){
          return res.status(400).json({ success: false, message: 'All fields are required' });
      }
      let existingUser = await Role.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ success: false, message: 'This username is already registered' });
      }
      const permissionData = await Permission.findById(roles).exec();
        if (!mongoose.isValidObjectId(permissionData)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Role IDs"
            });
        }
      const newUser = new Role({
        username,
        password,
        roles
      });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: "Internal Server Error" });
    }
};

////// permission create //////
exports.permissionCreate = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        if(!name || !permissions){
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        let existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ success: false, message: 'This name is already registered' });
        }
        const newPermission = new Permission({
          name,
          permissions
        });
        await newPermission.save();
        res.status(201).json(newPermission);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};

// permission name create ///////////
exports.permissionNameCreate = async (req, res) => {
    try {
        const { name, permission } = req.body;
        if(!name || !permission){
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        let existingPermission = await Permissionname.findOne({ name });
        if (existingPermission) {
            return res.status(400).json({ success: false, message: 'This name is already registered' });
        }
        const newPermission = new Permissionname({
          name,
          permission
        });
        await newPermission.save();
        res.status(201).json(newPermission);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
};


exports.dashboard = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalCanceled = await Order.countDocuments({ order_status: "canceled" });
        const totalReturns = await Order.countDocuments({ order_status: "returned" });
        const pendingOrders = await Order.countDocuments({ order_status: "pending" });
        const confirmedOrders = await Order.countDocuments({ order_status: "confirmed" });

        const topSellingProducts = await Order.aggregate([
            { $unwind: "$order_item" },
            {
                $group: {
                    _id: "$order_item.product_id",
                    quantity_sold: { $sum: "$order_item.quantity" },
                    total_revenue: { $sum: "$order_item.price" }
                }
            },
            { $sort: { quantity_sold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    product_id: "$_id",
                    quantity_sold: 1,
                    total_revenue: 1,
                    product_name: { $arrayElemAt: ["$productDetails.name", 0] }
                }
            }
        ]);

        const stats = {
            totalOrders,
            totalUsers,
            totalProducts,
            totalCategories,
            totalCanceled,
            totalReturns,   
            pendingOrders,
            confirmedOrders,
            topSellingProducts
        };

        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.salesExpanse = async (req, res) => {

    const { filter } = req.body;

    try {
        if (filter === "day") {
            let dayData = [];
            for (let i = 0; i < 12; i++) {
                const startHour = new Date();
                startHour.setTime(startHour.getTime() + (5.5 * 60 * 60 * 1000));
                startHour.setHours(startHour.getHours() - i * 2);

                const endHour = new Date(startHour);
                endHour.setHours(endHour.getHours() - 2);

                const orders = await Order.find({
                    createdAt: { $gte: endHour, $lte: startHour }
                }).sort('-createdAt');

                let sales = 0;
                let expense = 0;

                orders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_charge + order.gst;
                });

                startHour.setHours(startHour.getHours() - 5);
                startHour.setMinutes(startHour.getMinutes() - 30);
                endHour.setHours(endHour.getHours() - 5);
                endHour.setMinutes(endHour.getMinutes() - 30);

                const formattedStartHour = startHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedEndHour = endHour.toLocaleString('en-US', { hour: 'numeric', hour12: true });
                const formattedDate = `${formattedEndHour} - ${formattedStartHour}`;

                dayData.push({
                    date: formattedDate,
                    sales,
                    expense
                });
            }

            return res.status(200).json({
                status: true,
                label: 'Day',
                data: dayData
            });
        }
        else if (filter === "week") {
            const lastWeekDate = new Date();
            lastWeekDate.setDate(lastWeekDate.getDate() - 7);
            const orders = await Order.find({ createdAt: { $gte: lastWeekDate } });
            const label = 'Week';
            const response = [];

            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit' });
                const formattedMonth = date.toLocaleDateString('en-US', { month: 'short' });

                const dayOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    return orderDate === `${formattedMonth} ${formattedDate}`;
                });

                let sales = 0;
                let expense = 0;

                dayOrders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_charge + order.gst;
                });

                response.push({
                    Label: `${formattedDate} ${formattedMonth}`,
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label,
                data: response
            });
        }
        else if (filter === "month") {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 7);
            const orders = await Order.find({ createdAt: { $gte: firstDayOfMonth } });
            const label = 'Month';
            const response = [];

            for (let i = 0; i < 6; i++) {
                const month = new Date(currentDate);
                month.setMonth(currentDate.getMonth() - i);
                const formattedMonth = month.toLocaleDateString('en-US', { month: 'short' });

                const monthOrders = orders.filter(order => {
                    const orderMonth = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
                    return orderMonth === formattedMonth;
                });

                let sales = 0;
                let expense = 0;

                monthOrders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_charge + order.gst;
                });

                response.push({
                    Label: formattedMonth,
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label,
                data: response
            });
        }
        else if (filter === "year") {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const response = [];

            for (let i = 0; i < 6; i++) {
                const year = currentYear - i;
                const orders = await Order.find({
                    createdAt: {
                        $gte: new Date(year, 0, 1),
                        $lte: new Date(year, 11, 31, 23, 59, 59)
                    }
                });

                let sales = 0;
                let expense = 0;

                orders.forEach(order => {
                    sales += order.totalPrice;
                    expense += order.shipping_charge + order.gst;
                });

                response.push({
                    Label: year.toString(),
                    Sales: sales,
                    Expense: expense
                });
            }

            return res.status(200).json({
                status: true,
                label: 'Year',
                data: response
            });

        }
        else {
            return res.status(200).json({ status: false, message: "Invalid filter!" });
        }
    } catch (error) {
        return res.status(200).json({ status: false, message: "Server error", error: error.message });
    }
};

exports.compareSale = async (req, res) => {
    const { filter } = req.body;
    try {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 5.5); // Convert to IST
        let response = {
            status: true,
            label: '',
            data: {
                currentPeriod: {
                    label: '',
                    sales: 0,
                    expense: 0
                },
                comparisonPeriod: {
                    label: '',
                    sales: 0,
                    expense: 0
                },
                comparison: {
                    compare: 0,
                    percentage: '0%'
                }
            }
        };
        if (filter === "month") {
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            const startCurrentPeriod = new Date(currentYear, currentMonth - 5, 1);
            startCurrentPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endCurrentPeriod = new Date(currentYear, currentMonth + 1, 0);
            endCurrentPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST
            const startComparisonPeriod = new Date(currentYear, currentMonth - 11, 1);
            startComparisonPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endComparisonPeriod = new Date(currentYear, currentMonth - 5, 0);
            endComparisonPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST
            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });
            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });
            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;
            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.gst + order.shipping_charge;
            });
            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.gst + order.shipping_charge;
            });
            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';
            response.label = 'Month';
            response.data.currentPeriod.label = `${endCurrentPeriod.toLocaleString('en-IN', { month: 'short' })}-${startCurrentPeriod.toLocaleString('en-IN', { month: 'short' })}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${endComparisonPeriod.toLocaleString('en-IN', { month: 'short' })}-${startComparisonPeriod.toLocaleString('en-IN', { month: 'short' })}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;
            return res.status(200).json(response);
        } else if (filter === "year") {
            const currentYear = currentDate.getFullYear();
            const startCurrentPeriod = new Date(currentDate);
            startCurrentPeriod.setFullYear(currentYear - 1);
            startCurrentPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endCurrentPeriod = new Date(currentDate);
            endCurrentPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST
            const startComparisonPeriod = new Date(startCurrentPeriod);
            startComparisonPeriod.setFullYear(startComparisonPeriod.getFullYear() - 1);
            startComparisonPeriod.setHours(5.5, 0, 0, 0); // Start of the day in IST
            const endComparisonPeriod = new Date(startCurrentPeriod);
            endComparisonPeriod.setHours(23.5, 59, 59, 999); // End of the day in IST
            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });
            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });
            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;
            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.gst + order.shipping_charge;
            });
            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.gst + order.shipping_charge;
            });
            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';
            response.label = 'Year';
            response.data.currentPeriod.label = `${endCurrentPeriod.getFullYear()}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${endComparisonPeriod.getFullYear()}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;
            return res.status(200).json(response);
        } else if (filter === "week") {
            const endCurrentPeriod = new Date(currentDate);
            endCurrentPeriod.setHours(23, 59, 59, 999); // End of the day in IST
            const startCurrentPeriod = new Date(endCurrentPeriod);
            startCurrentPeriod.setDate(startCurrentPeriod.getDate() - 6); // Start of the week
            startCurrentPeriod.setHours(0, 0, 0, 0); // Start of the day in IST
            const endComparisonPeriod = new Date(startCurrentPeriod);
            endComparisonPeriod.setDate(endComparisonPeriod.getDate() - 1); // End of the previous week
            endComparisonPeriod.setHours(23, 59, 59, 999); // End of the day in IST
            const startComparisonPeriod = new Date(endComparisonPeriod);
            startComparisonPeriod.setDate(startComparisonPeriod.getDate() - 6); // Start of the previous week
            startComparisonPeriod.setHours(0, 0, 0, 0); // Start of the day in IST
            const currentOrders = await Order.find({
                createdAt: { $gte: startCurrentPeriod, $lte: endCurrentPeriod }
            });
            const comparisonOrders = await Order.find({
                createdAt: { $gte: startComparisonPeriod, $lte: endComparisonPeriod }
            });
            let currentPeriodSales = 0;
            let currentExpense = 0;
            let comparisonPeriodSales = 0;
            let comparisonExpense = 0;
            currentOrders.forEach(order => {
                currentPeriodSales += order.totalPrice;
                currentExpense += order.gst + order.shipping_charge;
            });
            comparisonOrders.forEach(order => {
                comparisonPeriodSales += order.totalPrice;
                comparisonExpense += order.gst + order.shipping_charge;
            });
            const salesDifference = currentPeriodSales - comparisonPeriodSales;
            const salesPercentageChange = comparisonPeriodSales === 0
                ? (currentPeriodSales === 0 ? '0%' : '100%')
                : ((salesDifference / comparisonPeriodSales) * 100).toFixed(2) + '%';
            const dayFormat = { weekday: 'short' };
            const currentStartDayLabel = startCurrentPeriod.toLocaleString('en-IN', dayFormat);
            const currentEndDayLabel = endCurrentPeriod.toLocaleString('en-IN', dayFormat);
            const comparisonStartDayLabel = startComparisonPeriod.toLocaleString('en-IN', dayFormat);
            const comparisonEndDayLabel = endComparisonPeriod.toLocaleString('en-IN', dayFormat);
            response.label = 'Week';
            response.data.currentPeriod.label = `${currentEndDayLabel}-${currentStartDayLabel}`;
            response.data.currentPeriod.sales = currentPeriodSales;
            response.data.currentPeriod.expense = currentExpense;
            response.data.comparisonPeriod.label = `${comparisonEndDayLabel}-${comparisonStartDayLabel}`;
            response.data.comparisonPeriod.sales = comparisonPeriodSales;
            response.data.comparisonPeriod.expense = comparisonExpense;
            response.data.comparison.compare = salesDifference;
            response.data.comparison.percentage = salesPercentageChange;
            return res.status(200).json(response);
        } else {
            return res.status(200).json({ status: false, message: "Invalid filter!" });
        }
    } catch (error) {
        console.error("Error fetching sales data:", error);
        return res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};