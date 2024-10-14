const Product = require("../model/product.model");
const Tags = require("../model/tags.model");



////////////////////////////// tags (admin) /////////////////////

exports.tagsCreate = async (req, res, next) => {
    const { tag,slug, description } = req.body;
    try {
        const validation = { tag,slug, description };
        const missingField = Object.keys(validation).find(key => validation[key] === undefined);
        if (missingField) {
            return res.status(200).json({ success: false, message: `${missingField} is missing` });
        }
        const encode = slug.replace(/\s+/g, '-'); 
        const newTags = await Tags.create({
            tag,
            slug: encode,
            description
        })
        if(!newTags){
            res.status(200).json({success:false, message: "tags Unsuccessfull"})
        }else {
            res.status(200).json({success:true, message: "tags SuccessFully Add"})
        }
    } catch {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////////// get tags (usser) ////////////

exports.getTags = async (req, res, next) => {
    try {
        let filter = {}
        if(req.body.id)
        {
            filter = {tags: req.body.id.split(',')}
        }
        const prodectList = await Product.find(filter).populate('tags');
        res.status(200).json({
            success:true,       
            tags:prodectList
        })
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
///////////////////////get all tags (user) ////////////
exports.getAllTags = async (req, res, next) => {
    try {
        const tags = await Tags.find();
        if (!tags) {
            return res.status(200).json({ success: false, message: "Tags not found" });
        }
        res.status(200).json({ success: true, message:tags });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////////// delet tags (admin) ////////////

exports.deleteTags = async (req, res, next) => {
    try {
        const deletedTags = await Tags.findByIdAndDelete(req.body.id);
        if (!deletedTags) {
            return res.status(200).json({ success: false, message: "Tags not found" });
        }
        res.status(200).json({ success: true, message: "Tags deleted successfully", deletedTags });
    } catch (error) {
        console.error("Error deleting Tags:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};