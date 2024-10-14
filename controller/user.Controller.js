const { parsePhoneNumberFromString } = require('libphonenumber-js');
const sendToken = require('../utils/jwtToken');
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require('bcrypt');
const User = require('../model/user.model');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');


// P7F9XB18DDKQR6M2PT81SWMK
//ACc423b91cf3df7733dccee586231b16dc
/////////////// user account create /////////
// exports.userCreate = async (req, res, next) => {
//     const { name, email_id, password, pages, phone_number, guestId } = req.body;

//     const validation = {  name, email_id, password, phone_number  };

//     const missingField = Object.keys(validation).find(key => validation[key] === undefined);
//     if (missingField) {
//         return res.status(200).json({ success: false, message: `${missingField} is missing` });
//     }

//     try {
       
//         let existingUser = await User.findOne({ email_id });
//         if (existingUser) {
//             return res.status(400).json({ success: false, message: 'This email is already registered' });
//         }
//         const existingPhoneNumber = await User.findOne({ phone_number });
//         if (existingPhoneNumber) {
//             return res.status(400).json({ success: false, message: "Phone number already exists" });
//         }
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email_id.toLowerCase())) {
//             return res.status(400).json({ success: false, message: 'Invalid email address' });
//         }
//         if (password.length < 8) {
//             return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
//         }
//          const phoneNumber = parsePhoneNumberFromString(phone_number);
//          if (!phoneNumber || !phoneNumber.isValid()) {
//              return res.status(400).json({ success: false, message: 'Invalid phone number' });
//          }
        
//         const newUser = new User({
//             name,
//             email_id,
//             password,
//             type: "user",
//             pages,
//             phone_number: phoneNumber.number
//         });
//         if (newUser.isDeleted) {
//             return res.status(400).json({ success: false, message: 'Cannot create user. Account is marked as deleted.' });
//         }
//         const OTP = newUser.generateOTP();
//         await newUser.save();
//         // const message = await twilioClient.messages.create({
//         //     body: `Your OTP for verification is: ${OTP}`,
//         //     from: 'whatsapp:+14155238886', // Twilio Sandbox WhatsApp number
//         //     to: `whatsapp:${phoneNumber.number}`,
//         // });
//         const message = await sendEmail({
//             email: email_id,
//             subject: 'Email OTP',
//             message: `Your OTP for verification is: ${OTP}`,
//         });
//         if (!message) {
//             return res.status(500).json({ success: false, message: 'Error while sending OTP' });
//         }
//         res.status(200).json({ success: true, message: 'Otp Send SuccessFully' });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         return res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };
exports.userCreate = async (req, res, next) => {
    const { name, email_id, password, pages, phone_number } = req.body;

    const validation = {  name, email_id, password, phone_number  };

    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(200).json({ success: false, message: `${missingField} is missing` });
    }

    try {
       
        let existingUser = await User.findOne({ email_id });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'This email is already registered' });
        }
        const existingPhoneNumber = await User.findOne({ phone_number });
        if (existingPhoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number already exists" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_id.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        }
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }
         const phoneNumber = parsePhoneNumberFromString(phone_number);
         if (!phoneNumber || !phoneNumber.isValid()) {
             return res.status(400).json({ success: false, message: 'Invalid phone number' });
         }
        if(req.cookies.guestId) {
            let guestUser = await User.findById(req.cookies.guestId);
            if (!guestUser) {
                return res.status(404).json({ success: false, message: 'Guest user not found' });
            }
            guestUser.name = name;
            guestUser.email_id = email_id;
            guestUser.password = password; 
            guestUser.role = "user";
            guestUser.pages = pages;
            guestUser.phone_number = phoneNumber.number;
            guestUser.guestId = undefined;
            guestUser.isGuest = false;

            const OTP = guestUser.generateOTP();
            await guestUser.save();
            const message = await sendEmail({
                email: email_id,
                subject: 'Email OTP',
                message: `Your OTP for verification is: ${OTP}`,
            });
            if (!message) {
                return res.status(500).json({ success: false, message: 'Error while sending OTP' });
            }
            res.status(200).json({ success: true, message: 'Otp Send SuccessFully' });
        } else {
            const newUser = new User({
                name,
                email_id,
                password,
                type: "user",
                pages,
                phone_number: phoneNumber.number
            });
            if (newUser.isDeleted) {
                return res.status(400).json({ success: false, message: 'Cannot create user. Account is marked as deleted.' });
            }
            const OTP = newUser.generateOTP();
            await newUser.save();
            const message = await sendEmail({
                email: email_id,
                subject: 'Email OTP',
                message: `Your OTP for verification is: ${OTP}`,
            });
            if (!message) {
                return res.status(500).json({ success: false, message: 'Error while sending OTP' });
            }
            res.status(200).json({ success: true, message: 'Otp Send SuccessFully' });
        }
        
        
        // const message = await twilioClient.messages.create({
        //     body: `Your OTP for verification is: ${OTP}`,
        //     from: 'whatsapp:+14155238886', // Twilio Sandbox WhatsApp number
        //     to: `whatsapp:${phoneNumber.number}`,
        // });
        
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
/////////////////// verifyOtp ////////////////// 
exports.verifyOtp = async (req, res, next) => {
    const { email_id, otp } = req.body;
    try {
        const user = await User.findOne({ email_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
       if (user.otpExpires < Date.now()) {
            await User.deleteOne({ email_id });
            return res.status(400).json({ success: false, message: 'OTP has expired and user has been deleted. Please register again.' });
        }
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        sendToken(user, 200, res, "User register SuccessFully");
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
///////////////// re-send otp ////////////////
exports.resendOTP = async (req, res, next) => {
    const { email_id } = req.body;

    try {
        const user = await User.findOne({ email_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if(user.otp){
            const OTP = user.generateOTP();
            await user.save();
            const message = `Your new OTP for verification is: ${OTP}`;
            await sendEmail({
                email: email_id,
                subject: 'New OTP for Verification',
                message,
            });
            res.status(200).json({ success: true, message: 'New OTP sent successfully' });
        }else {
            res.status(200).json({ success: false, message: "This user alady register culn't send otp" });
        }
    } catch (error) {
        console.error('Error re-sending OTP:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
///////////// update user (auth.user) ///////// 
exports.profileUpdate = async (req, res) => {
    const { name, email_id } = req.body;
    try {
        // Find the user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        // Update user details
        if (name !== undefined) user.name = name;

        if (email_id !== undefined) {
            // Check if the email is already taken by another user
            const existingUser = await User.findOne({ email_id });
            if (existingUser && existingUser._id.toString() !== req.user.id) {
                return res.status(400).json({ success: false, message: 'This email is already registered' });
            }

            // Validate the email address
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email_id.toLowerCase())) {
                return res.status(400).json({ success: false, message: 'Invalid email address' });
            }

            user.email_id = email_id;
        }

        if (req.files && req.files.image) {
            const uploadedFile = req.files.image;
            const fileSizeInMB = uploadedFile.size / (1024 * 1024);
            if (fileSizeInMB > 2) {
                return res.status(400).json({ success: false, message: 'Image size exceeds 2 MB' });
            }
            const allowedImageTypes = /jpeg|jpg|png/;
            if (!allowedImageTypes.test(uploadedFile.mimetype)) {
                return res.status(400).json({ success: false, message: 'Invalid image format. Only jpeg, jpg, and png are allowed.' });
            }

            const oldImagePath = user.image ? path.join(__dirname, `../${user.image.replace(/^.*\/\/[^\/]+/, '')}`) : null;
            const newFileName = `${Date.now()}_${uploadedFile.name}`;
            const newImagePath = path.join(__dirname, `../profile/user-media/${newFileName}`);
            await sharp(uploadedFile.data)
            .jpeg({ quality: 90 })
            .toFile(newImagePath);
            // await uploadedFile.mv(newImagePath);
            
            // Update the user image URL
            const imageUrl = `${req.protocol}://${req.get('host')}/profile/user-media/${newFileName}`;
            user.image = imageUrl;

            if (oldImagePath && oldImagePath !== newImagePath) {
                await fs.unlink(oldImagePath);
            }
        }

        user.updatedAt = new Date();
        await user.save();

        res.status(200).json({ success: true, message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// update User password (auth.user) ///////////
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("+password");
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
        if (!isPasswordMatched) {
            return res.status(200).json({ success: false, message: "Old password is incorrect" });
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(200).json({ success: false, message: "password does not match" });
        }
        user.password = req.body.newPassword;
        await user.save();
        sendToken(user, 200, res);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
////////////// get usre diteail (auth.user) ////////////

exports.userDetail = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }
        if (user.isDeleted) {
            return res.status(403).json({ success: false, message: "This user account has been deleted. You can't access this account." });
        }
        res.status(200).json({ 
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

/////////////// user delet (auth.useer)  ////////
exports.selfDelet = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "User Not Found"
            });
        }
        user.isDeleted = true;
        await user.save();
        res.status(200).json({
            success: true,
            message: "User as deleted successfully"
        });
        
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

////////////// get all user diteail (admin) //////
exports.userAllDetails =  async (req,res,next) =>{
    try {
        const id = await User.find()
        if (!id) {
            return res.status(200).json({ success: false, message: "User Not Found" });
        }
        res.status(200).json({ 
            success:true,
            total: id.length,
            id
        })
    } catch {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
}

//////////// Delet User (admin) //////////////
exports.userDelet = async (req,res,next) =>{
    try {
        const id = await User.findById(req.body.id)
        if (!id) {
            return res.status(200).json({ success: false, message: "User Not Found" });
        }
        await User.findByIdAndDelete(id)
        res.status(200).json({
            success:true,
            message:"User Delet successfully"
        })
    } catch{
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    
}

// Get single user (admin) ///////////////////
exports.getSingleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.body.id);
        if (!user) {
            return res.status(200).json({ success: false, message: `User does not exist with Id: ${req.params.id}` });
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

// update User Role -- (Admin)
exports.updateUserRole = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            email_id: req.body.email_id,
            type: req.body.type,
        };
        await User.findByIdAndUpdate(req.body.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });
        res.status(200).json({
            success: true,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
    
////////////// login and logout  ////////////////
exports.login =  async (req,res,next) =>{
    const { email_id, password } = req.body;
    const validation = {  email_id, password  };
    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(200).json({ success: false, message: `${missingField} is missing` });
    }
    try{
        const user = await User.findOne({ email_id });
        if(!user){
            return res.status(200).json({ success: false, message: "Email  combination is invalid" });
        }
        if (!user || user.isDeleted) {
            return res.status(404).json({ success: false, message: "User not found or account is deleted" });
        }
         if (user.otp !== undefined && user.otpExpires > Date.now()) {
            return res.status(200).json({ success: false, message: "OTP verification is required before logging in" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(200).json({ success: false, message: "Password combination is invalid" });
        }
        user.otp = undefined;
        user.otpExpires = undefined;
        const userWithoutPassword = { ...user._doc };
        delete userWithoutPassword.password;
        sendToken(user, 200, res, "Login successful");
    }catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
} /// user login 
exports.logout =  async (req,res,next) =>{
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
          });
          res.status(200).json({
            success: true,
            message: "Logged Out",
          });
    } catch{
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
///////////////////////////// Forgot Password ////////////////////////////////
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email_id: req.body.email });
    if (!user) {
      return res.status(200).json({ success: false, message: "User not found" });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;
    try {
      await sendEmail({
        email: user.email_id,
        subject: `Ecommerce Password Recovery`,
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email_id} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false,message: error.message });
    }
};   ////done

//////////////////////// Reset Password //////////////////////
exports.resetPassword = async (req, res, next) => {
    try {
        const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(200).json({ success: false, message: "Reset Password Token is invalid or has been expired" });
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(200).json({ success: false, message: "Password does not password" });
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        sendToken(user, 200, res);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}   ////// done