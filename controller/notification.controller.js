const Notification = require("../model/notification.model");
const User = require("../model/user.model");
const { default: mongoose } = require('mongoose');

exports.sendNotification = async (req, res) => {
    const { type, target, user_id, subtype, title, description, image, payload } = req.body;
    const validation = { type, target,  subtype, title, description, image, payload };


    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(400).json({ success: false, message: `${missingField} is missing` });
    }
    try {
        let notifications = [];
        const baseNotification = {
            type,
            subtype,
            title,
            description,
            image,
            payload
        };
        if (type === 'general' || type === 'application') {
            if (target === 'specific') {
                if (!user_id) {
                    return res.status(400).json({ success: false, message: "User ID is required for specific target" });
                }
                const specificUser = await User.findOne({_id:user_id});
                if (!specificUser) {
                    console.log("hi")
                    return res.status(404).json({ success: false, message: "User not found" });
                }
                notifications = [{
                    ...baseNotification,
                    user_id: specificUser._id,
                    target: 'specific'
                }];
            }
            else if (target === 'user' || target === 'guest') {
                    const users = target === 'user' ? await User.find({ role: 'user' }, '_id') : await User.find({ role: 'guest' }, '_id');
                    if (users.length > 0) {
                        notifications = [{
                            ...baseNotification,
                            target,
                        }];
                    } else {
                        return res.status(400).json({ success: false, message: `No ${target} found` });
                    }
                } else {
                    return res.status(400).json({ success: false, message: "Invalid Type" });
                }
        }
         else {
            return res.status(400).json({ success: false, message: "Invalid notification type" });
        }
        // for (let i  = 0;  i < notifications.length; i++) {
        //     await Notification.create(notifications[i]);
        // }
        await Notification.insertMany(notifications);
        res.status(201).json({ success: true, message: "Notifications sent successfully", notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// exports.getNotification = async (req, res) => {

//     try {
//         const { type } = req.body;
//         const user = req.user.role;
//         const user_id = req.user._id;


//         if (!type) {
//             return res.status(200).json({ status: false, message: "type is required!" })
//         }

//         if (type === 'general' || type === 'application') {
//             const notifications = await Notification.find({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ $and: [{ user_id: user_id }] }] });

//             return res.status(200).json({ success: true, total: notifications.length, notifications: notifications });

//         }
//         else {
//             return res.status(200).json({ success: false, message: 'Invalid notification type' });
//         }
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };



exports.getNotification = async (req, res) => {
    try {
        const { type } = req.body; 
        const user = req.user.role;
        const user_id = req.user._id;

        if (!type) {
            return res.status(400).json({ success: false, message: "Type is required!" });
        }

        if (type !== 'general' && type !== 'application') {
            return res.status(400).json({ success: false, message: 'Invalid notification type' });
        }

        let query = { type };

        if (type === 'general') {
            query = { ...query, target: user };
        } else if (type === 'application') {
            query = {
                $or: [
                    { target: 'specific', user_id },
                    { target: 'general' }
                ]
            };
        }

        const notifications = await Notification.find(query).exec();

        return res.status(200).json({
            success: true,
            total: notifications.length,
            notifications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.pre_view_notification = async (req, res) => {
    try {

        const { notification_id } = req.body;
        const user = req.user.role;
        const user_id = req.user._id;


        if (!notification_id) {
            return res.status(200).json({ status: false, message: "notification_id is required!" })
        }
        if (!mongoose.isValidObjectId(notification_id)) {
            return res.status(200).json({ success: false, message: 'Invalid ID!' });
        }

        const notification = await Notification.findOne({ _id: notification_id, $or: [{ target: user }, { $and: [{ target: 'specific' }] }], $or: [{ $and: [{ user_id: user_id }] }] });
        console.log(notification);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        return res.status(200).json({ success: true, notification });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.delete_many_notification = async (req, res) => {
    const user = req.user.role;
    const user_id = req.user._id;
    const notification = await Notification.find({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }] , $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });
    if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    await Notification.deleteMany({ $or: [{ target: user }, { $and: [{ target: 'specific' }] }] , $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });
    return res.status(200).json({ success: true,total : notification.length  , notifications: notification });
}
exports.delete_One_Notification = async(req,res)=>{
    const {notification_id} = req.body;
    const user = req.user.role;
    const user_id = req.user._id;
      if (!mongoose.isValidObjectId(notification_id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID!' });
        }
        const data = await Notification.findOneAndDelete({ _id: notification_id, $or: [{ target: user }, { $and: [{ target: 'specific' }] }] , $or: [{ target: user }, { $and: [{ user_id: user_id }] }] });
    if (!data ) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
    }
        return res.status(200).json({ success: true, message:"delete successfully" });
}

exports.updateNotification = async (req, res) => {
    const { notificationId } = req.body;
    const { type, target, title, description, image, payload, user_id } = req.body;
    const validation = { type, target, title, description, image, payload, user_id};

    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(400).json({ success: false, message: `${missingField} is missing` });
    }
    try {
        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({ success: false, message: 'Invalid notification ID!' });
        }

        const updateObject = {
            type,
            target,
            title,
            description,
            image,
            payload
        };

        if (target === 'specific') {
            updateObject.user_id = user_id;
        } else if (target === 'user' || target === 'guest') {
            updateObject.$unset = { user_id: 1 };
        }

        const notification = await Notification.findByIdAndUpdate(notificationId, updateObject, { new: true });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, message: 'Notification updated successfully', notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

