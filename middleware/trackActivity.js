// middleware/trackActivity.js

const UserActivity = require('../model/userTracking.model');

const trackActivity = (description) => {
    return async (req, res, next) => {
        if (req.user) {
            const activity = new UserActivity({
                user: req.user.id,
                description,
                timestamp: new Date()
            });

            try {
                await activity.save();
                console.log(`Activity logged: ${description}`);
            } catch (error) {
                console.error('Error logging activity:', error);
            }
        }
        next();
    };
};

module.exports = trackActivity;
