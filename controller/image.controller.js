const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');
const sizeOf = require('image-size');
const mime = require('mime-types');
const mongoose = require('mongoose');
const Image = require('../model/media.model');
const sharp = require('sharp');


///////////// create image (admin) //////////////// 
exports.imageCreate = async (req, res, next) => {
    const { alt_text } = req.body;
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        const file = req.files.file;
        const fileName = file.name;
        const fileExt = path.extname(fileName);
        const uniqueFilename = `${uuid()}${fileExt}`;
        const fileType = mime.lookup(fileName);

        if (fileType !== 'image/jpeg' && fileType !== 'image/png' && fileType !== 'image/svg') {
            return res.status(400).json({ status: false, message: "Unsupported file format" });
        }
        
        const tempFilePath = path.join(__dirname, `../profile/uploads/${uniqueFilename}`);
        await sharp(file.data)
            .jpeg({ quality: 90 })
            .toFile(tempFilePath);

        const fileSizeInBytes = (await fs.stat(tempFilePath)).size;
       if (fileSizeInBytes > 2048576) {
            return res.status(400).json({ status: false, message: "File size should be less than 2 MB"});
       }
        let fileDetails = null;
        if (fileType && fileType.startsWith("image")) {
            fileDetails = sizeOf(tempFilePath);
        }

        const url = `/profile/uploads/${uniqueFilename}`;
        const existingImage = await Image.findOne({ name: fileName });
        if (existingImage) {
            const oldFilePath = path.join(__dirname, `../profile/uploads/${existingImage.url.split('/').pop()}`);
            await fs.unlink(oldFilePath);
            await Image.findByIdAndUpdate(existingImage._id, {
                altText: alt_text,
                name: fileName,
                size: fileSizeInBytes,
                type: fileType,
                url,
                dimension: fileDetails ? {
                    width: fileDetails.width,
                    height: fileDetails.height
                } : undefined
            });
        } else {
            const profileObject = {
                altText: alt_text,
                name: fileName,
                size: fileSizeInBytes,
                type: fileType,
                url,
                dimension: fileDetails ? {
                    width: fileDetails.width,
                    height: fileDetails.height
                } : undefined
            };
            await Image.create(profileObject);
        }

        return res.status(200).json({ status: true, message: "Profile added successfully" });
    } catch (error) {
        console.error("Error adding/updating profile:", error);
        return res.status(500).json({ status: false, message: "Internal server error!" });
    }
};
// Update image (admin)
exports.updateImage = async (req, res, next) => {
    const { alt_text, profile_id } = req.body;
    try {
        if (!mongoose.isValidObjectId(profile_id)) {
            return res.status(200).json({ status: false, message: "Invalid profile id!" });
        }

        const profile = await Image.findById(profile_id);
        if (!profile) {
            return res.status(200).json({ status: false, message: "Profile not found" });
        }

        if (!req.files || !req.files.file) {
            return res.status(200).json({ status: false, message: "File not found" });
        }

        const file = req.files.file;
        const fileName = file.name;
        const fileExt = path.extname(fileName);
        const newTempFilePath = path.join(__dirname, `../profile/uploads/${uuid()}${fileExt}`);

        // Save the uploaded file to a temporary location
        await file.mv(newTempFilePath);

        // Delete the old file
        if (profile.url) {
            const oldFilePath = path.join(__dirname, `../profile/uploads/${path.basename(profile.url)}`);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error("Error deleting old file:", err);
            }
        }

        const newFileName = path.basename(newTempFilePath); // Get the new file name
        // Update profile details
        profile.altText = alt_text;
        profile.name = fileName;
        profile.url = `/profile/uploads/${newFileName}`;
        profile.type = mime.lookup(fileName);
        profile.size = file.size;

        if (profile.type && profile.type.startsWith("image")) {
            const detail = sizeOf(newTempFilePath);
            profile.dimension = {
                width: detail.width,
                height: detail.height,
            };
        } else {
            profile.dimension = null;
        }
        profile.updatedAt = new Date();
        await profile.save();
        
        return res.status(200).json({ status: true, message: "Profile updated successfully!" });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error!" });
    }
};


///////////////////// delete image  (admin) //////////
exports.deleteImage = async (req, res, next) => {
    const { media_id } = req.body;
    try {
      if (!mongoose.isValidObjectId(media_id)) {
        return res.status(400).json({ status: false, message: "Invalid media id!" });
      }
  
      const media = await Image.findById(media_id);
      if (!media) {
        return res.status(404).json({ status: false, message: "Media not found" });
      }
  
      // Remove file from storage path if it exists
      if (media.url) {
        const filePath = path.resolve(__dirname, `../profile/uploads/${media.url.split("/").pop()}`);
        try {
          await fs.access(filePath); // Check if file exists
          await fs.unlink(filePath); // Delete the file
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      }
  
      const result = await Image.deleteOne({ _id: media_id });
      if (result.deletedCount > 0) {
        return res.status(200).json({ status: true, message: "Media deleted successfully!" });
      } else {
        return res.status(500).json({ status: false, message: "Media delete failed!" });
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      return res.status(500).json({ status: false, message: "Internal server error!" });
    }
};

/////////// get all image (admin) ///////////
exports.getAllImages = async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json({ status: true, data: images });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ status: false, message: 'Internal server error!' });
    }
};


//////////// get image  (admin) /////////////
exports.getImage = async (req, res) => {
    const { id } = req.body;
    try {
        const image = await Image.findById(id);
        if (!image) {
            return res.status(404).json({ status: false, message: 'Image not found!' });
        }
        res.status(200).json({ status: true, data: image });
    } catch (error) {
        console.error('Error fetching image by ID:', error);
        res.status(500).json({ status: false, message: 'Internal server error!' });
    }
};