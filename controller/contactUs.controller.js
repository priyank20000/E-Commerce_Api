const { toDate } = require("validator");
const ContactUs = require("../model/contactUs.model")
const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.createContactUs = async (req, res) => {
    const { name, phone, email, message, subject } = req.body
    if(!name || !phone || !email || !message || !subject){
        return res.status(400).json({ success: false, message: "All fields are required" })
    }
    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Invalid email address' });
        } 
         // Validate phone number
         const phoneNumber = parsePhoneNumberFromString(phone);
         if (!phoneNumber || !phoneNumber.isValid()) {
             return res.status(400).json({ success: false, message: 'Invalid phone number' });
         }
        const newContactUs = await ContactUs.create({
            name,
            phone: phoneNumber.number,
            email,
            message,
            subject
        })
        if(!newContactUs) return res.status(400).json({ success: false, message: "Contact Us not created" })
        res.status(200).json({ success: true, message: "Contact Us created successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }   
}
exports.getAllContactUs = async (req, res) => {
    try {
        const contactUs = await ContactUs.find()
        if(!contactUs) return res.status(400).json({ success: false, message: "Contact Us not found" })
        res.status(200).json({ success: true, total: contactUs.length, contactUs })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

exports.deleteContactUs = async (req, res) => {
    const { id } = req.body
    try {
        const contactUs = await ContactUs.findByIdAndDelete(id)
        if(!contactUs) return res.status(400).json({ success: false, message: "Contact Us not found" })
        res.status(200).json({ success: true, message: "Contact Us deleted successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}
