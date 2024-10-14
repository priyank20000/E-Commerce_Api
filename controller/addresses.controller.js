
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const Addresses = require('../model/addresses.model');
const Country = require('../model/country.model');
const State = require('../model/state.model');

exports.createAddress = async (req, res, next) => {
    try {
        const { address_1, address_2, state, city, pincode, nearby, type_of_address, phoneNumber, country } = req.body;

        const requiredFields = { address_1, address_2, state, city, pincode, nearby, type_of_address, phoneNumber, country };
        const missingField = Object.keys(requiredFields).find(key => !requiredFields[key]);
        if (missingField) {
            return res.status(400).json({ success: false, message: `${missingField} is missing` });
        }

        const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber);
        if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
            return res.status(400).json({ success: false, message: "Invalid phone number" });
        }

        const countryDoc = await Country.findById(country);
        if (!countryDoc || !countryDoc.isPublished) {
            return res.status(400).json({ success: false, message: "This country does not have access" });
        }

        const stateDoc = await State.findOne({ _id: state, country });
        if (!stateDoc || !stateDoc.isPublished) {
            return res.status(400).json({ success: false, message: "This state does not have access in the specified country" });
        }

        const existingUserAddress = await Addresses.findOne({ userId: req.user.id });

        if (existingUserAddress) {
            const addressExists = existingUserAddress.address.some(addr =>
                addr.address_1 === address_1 &&
                addr.pincode === pincode &&
                addr.city === city
            );

            if (addressExists) {
                return res.status(400).json({ success: false, message: "This address already exists for this user" });
            }

            existingUserAddress.address.push({
                address_1,
                address_2,
                country,
                state,
                city,
                pincode,
                nearby,
                type_of_address,
                phoneNumber: parsedPhoneNumber.number
            });
            
            await existingUserAddress.save();

            return res.status(200).json({ success: true, message: "Address added successfully", address: existingUserAddress });
        } else {
            const newAddress = await Addresses.create({
                userId: req.user.id,
                address: [{
                    address_1,
                    address_2,
                    country,
                    state,
                    city,
                    pincode,
                    nearby,
                    type_of_address,
                    phoneNumber: parsedPhoneNumber.number
                }]
            });

            if (!newAddress) {
                return res.status(400).json({ success: false, message: "Address not created" });
            }

            return res.status(200).json({ success: true, message: "Address created successfully", address: newAddress });
        }
    } catch (error) {
        console.error('Error creating address:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}; ////// user


exports.getAddresses = async (req, res, next) => {
    try {
        const addresses = await Addresses.find({ userId: req.user.id });
        if (!addresses) {
            return res.status(400).json({ success: false, message: "Addresses not found" });
        }
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} ///user

exports.getAddressById = async (req, res, next) => {
    try {
        const address = await Addresses.findById(req.body.id);
        if (!address) {
            return res.status(400).json({ success: false, message: "Address not found" });
        }
        res.status(200).json({ success: true, address });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} //user

exports.deleteAddress = async (req, res, next) => {
    try {
        const address = await Addresses.findOne({ 
            userId: req.user.id,
            'address._id': req.body.id 
        });
        if (!address) {
            return res.status(400).json({ success: false, message: "Address not found" });
        }
        const result = await Addresses.updateOne(
            { userId: req.user.id },
            { $pull: { address: { _id: req.body.id } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ success: false, message: "Address not found or not associated with the user" });
        }

        res.status(200).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}; ///user

exports.updateAddress = async (req, res, next) => {
    try {
        const { addressId, address_1, address_2, state, city, pincode, nearby, type_of_address, phoneNumber, country } = req.body;

        if (!addressId ) {
            return res.status(400).json({ success: false, message: "Address ID are required" });
        }
        const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'IN');
        if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
            return res.status(400).json({ success: false, message: "Invalid phone number" });
        }

        const address = await Addresses.findOne({ 
            userId: req.user.id,
            'address._id': addressId 
        });


        if (address) {
            const addressExists = address.address.some(addr =>
                addr.address_1 === address_1 &&
                addr.pincode === pincode &&
                addr.city === city
            );

            if (addressExists) {
                return res.status(400).json({ success: false, message: "This address already exists for this user" });
            }
        }

        if (!address) {
            return res.status(400).json({ success: false, message: "Address not found or not associated with the user" });
        }

        // Verify that the country exists and is published
        const countryDoc = await Country.findById(country);
        if (!countryDoc || !countryDoc.isPublished) {
            return res.status(400).json({ success: false, message: "Invalid or unpublished country" });
        }

        // Verify that the state exists, belongs to the specified country, and is published
        const stateDoc = await State.findOne({ _id: state, country });
        if (!stateDoc || !stateDoc.isPublished) {
            return res.status(400).json({ success: false, message: "Invalid or unpublished state for the specified country" });
        }

        // Update the address fields
        const result = await Addresses.updateOne(
            { userId: req.user.id, 'address._id': addressId },
            { $set: {
                'address.$.address_1': address_1,
                'address.$.address_2': address_2,
                'address.$.state': state,
                'address.$.city': city,
                'address.$.pincode': pincode,
                'address.$.nearby': nearby,
                'address.$.type_of_address': type_of_address,
                'address.$.phoneNumber': parsedPhoneNumber.number,
                'address.$.country': country
            }}
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ success: false, message: "Address update failed or address not found" });
        }

        res.status(200).json({ success: true, message: "Address updated successfully" });
    } catch (error) {
        console.error('Error updating address:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}; //user


/////////////////////////////////////////////////////////////

exports.countryisPublished = async (req, res, next) => {
    try {
        const country = await Country.findById(req.body.id);
        if (!country) {
            return res.status(200).json({
                success: false,
                message: "Country Not Found"
            });
        }
        const updatedIsPublished = !country.isPublished;
        const updatedCountry = await Country.findByIdAndUpdate(
            country._id,
            { isPublished: updatedIsPublished },
            { new: true }
        );
        if (!updatedCountry) {
            return res.status(200).json({ success: false, message: "Country Not Found" });
        }
        res.status(200).json({
            success: true,
            message: "isPublished updated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} ////////admin 

exports.getAllCountry = async (req, res, next) => {
    try {
        const countries = await Country.find();
        if (!countries) {
            return res.status(400).json({ success: false, message: "Countries not found" });
        }
        res.status(200).json({ success: true, countries });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} ////admin

exports.getisPublishedCountry = async (req, res, next) => {
    try {
        const country = await Country.find({ isPublished: true });
        if (!country) {
            return res.status(400).json({ success: false, message: "Country not found" });
        }
        res.status(200).json({ success: true, country });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} //////user

//////////////////////////////////////////////////////////////////////
exports.addState = async (req, res, next) => {
    const { name, country, isPublished } = req.body;
    try {
        const countryId = await Country.findById(country);
        if (!countryId) {
            return res.status(404).json({ message: 'Country not found' });
        }
        if (countryId.isPublished === false) {
            return res.status(400).json({ message: 'This country does not have access' });
        }
        const newState = await State.create({
            name,
            country,
            isPublished
        });
        if (!newState) {
            return res.status(400).json({ success: false, message: "State not created" });
        }
        res.status(200).json({ success: true, message: "State created successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
} //////admin 

exports.updateState = async (req, res, next) => {
    const { name, country } = req.body;
    try {
        const updatedState = await State.findByIdAndUpdate(
            req.body.id,
            { name, country },
            { new: true }
        );
        if (!updatedState) {
            return res.status(400).json({ success: false, message: "State not found" });
        }
        res.status(200).json({ success: true, message: "State updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.deleteState = async (req, res, next) => {
    try {
        const deletedState = await State.findByIdAndDelete(req.body.id);
        if (!deletedState) {
            return res.status(400).json({ success: false, message: "State not found" });
        }
        res.status(200).json({ success: true, message: "State deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.stateisPublished = async (req, res, next) => {
    try {
        const state = await State.findById(req.body.id);
        if (!state) {
            return res.status(200).json({
                success: false,
                message: "State Not Found"
            });
        }
        const updatedIsPublished = !state.isPublished;
        const updatedState = await State.findByIdAndUpdate(
            state._id,
            { isPublished: updatedIsPublished },
            { new: true }
        );
        if (!updatedState) {
            return res.status(200).json({ success: false, message: "State Not Found" });
        }
        res.status(200).json({
            success: true,
            message: "isPublished updated successfully"
        }); 
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getCountryByState = async (req, res, next) => {
    try {
        const states = await State.find({ country: req.body.country });
        if (!states) {
            return res.status(400).json({ success: false, message: "States not found" });
        }
        res.status(200).json({ success: true, states });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }   
}

exports.getAllState = async (req, res, next) => {
    try {
        const states = await State.find();
        if (!states) {
            return res.status(400).json({ success: false, message: "States not found" });
        }
        res.status(200).json({ success: true, states });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getisPublishedState = async (req, res, next) => {
    try {
        const states = await State.find({ isPublished: true });
        if (!states) {
            return res.status(400).json({ success: false, message: "States not found" });
        }
        res.status(200).json({ success: true, states });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

/////////////////////////////////////////////////