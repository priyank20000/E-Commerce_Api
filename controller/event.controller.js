const Event = require("../model/event.model");
const Category = require("../model/category.model");
const ImgUrl = require("../model/media.model");
const User = require("../model/user.model");
const EventCategory = require("../model/eventCategory.model");

//////////////////////////////////////////////////////////////////////Event api

//////////////////////////////// create Event (admin)
exports.createEvent = async (req, res, next) => {
    const {  title, image, description, category, authorName, isPublished } = req.body;
    const validation = {  title, image, description, category, authorName };

    const missingField = Object.keys(validation).find(key => validation[key] === undefined);
    if (missingField) {
        return res.status(200).json({ success: false, message: `${missingField} is missing` });
    }
    try {
        const categoryData = await Category.findById(category).lean().exec();
        if (!categoryData) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid category ID"
            });
        }
        const imageData = await ImgUrl.findById(image).exec();
        if (!imageData) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid image ID"
            });
        }
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(200).json({ 
                success: false,
                message: "Invalid user ID"
            });
        }
        const newEvent = await Event.create({
            title,
            image,
            description,
            category,
            createdBy: user,
            authorName,
            isPublished
        });
        if(!newEvent){
            res.status(200).json({ 
                success:false,
                message: "Event Does Not Create"
            }); 
        }
        res.status(200).json({ 
            success:true,
            message: "Event added successfully"
        });  
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(200).json({ success: false, message: 'Internal Server Error' });
    }
}

///////////////////////// get all Event (user)
exports.getAllEvent = async (req, res, next) => {
    try {
        const events = await Event.find({ isPublished: true })
        
        events.forEach(event => {
            event.comments = event.comments.filter(comment => comment.isPublished === true);
        });

        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
/////////////////////// get event (user)
exports.getEvent = async (req, res, next) => {
    try {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);


        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }

        if (!event.isPublished) {
            return res.status(404).json({ success: false, message: "This Event Is Not Published" });
        }

        // Filter out comments where isPublished is false
        event.comments = event.comments.filter(comment => comment.isPublished === true);

        return res.status(200).json({ success: true, data: event });
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

////////////////////// delet Event (admin) ////////////////////////
exports.deleteEvent = async (req, res, next) => {
    try {
        const { eventId } = req.body; // Assuming eventId is passed as a route parameter

        // Check if eventId is provided
        if (!eventId) {
            return res.status(400).json({ success: false, message: "Event ID is required" });
        }


        // Delete the event
        const deletedEvent = await Event.findByIdAndDelete(eventId);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        // Handle any unexpected errors
        console.error("Error in deleteEvent:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

////////////////////////// update Event (admin) ////////////////

exports.updateEvent = async(req, res, next) => {
    try {
        const {name, description} =req.body
        const updateEvent = await Event.findByIdAndUpdate(req.body.id, {name,description},{new:true})
        if(updateEvent){
            res.status(200).json({message:"Event Update SuccessFully", updateEvent})
        }else{
            res.status(400).json({message:"Event Not Found"})
        }
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }    
}


//////////////////////////////////////////////////Evint comment api (done)

////////////// add comment (user)
exports.addComment = async (req, res) => {
    const { eventId,  comment } = req.body;

    try {
        const event = await Event.findById(eventId);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (!event.isPublished) {
            return res.status(404).json({ success: false, message: "This Event Is Not Published" });
        }
        // Create new comment subdocument
        const newComment = {
            userId: req.user.id,
            comment
        };

        // Add the new comment to the event's comments array
        event.comments.push(newComment);

        // Save the updated event
        await event.save();

        res.status(201).json({success: true, message: 'Comment added successfully'});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}; 

/////////get comment by event (admin)
exports.getCommentsByEvent = async (req, res) => {
    const { eventId } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        const publishedComments = event.comments
        
        res.status(201).json({success: true, publishedComments});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 

////////////// get all comment (admin)
exports.getAllComments = async (req, res) => {
    try {
        const events = await Event.find();
        
        let allComments = [];
        events.forEach(event => {
            const commentsWithEventId = event.comments
                .map(comment => ({
                    eventId: event._id,
                    eventTitle: event.title, 
                    ...comment.toObject() 
                }));

            allComments = [...allComments, ...commentsWithEventId];
        });

        res.status(201).json({success: true, allComments});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 
/////////////////// update comment (admin)
exports.updateComment = async (req, res) => {
    const { eventId, commentId } = req.body; // Retrieve eventId and commentId from URL params

    try {
        // Find the event by eventId
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Find the comment within the event's comments array
        const commentToUpdate = event.comments.find(comment => comment._id.toString() === commentId);
        if (!commentToUpdate) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Toggle the isPublished field
        commentToUpdate.isPublished = !commentToUpdate.isPublished;

        // Save the updated event
        await event.save();

        // Return the updated comment
        res.status(201).json({success: true, message: `Comment ${commentToUpdate.isPublished ? 'published' : 'unpublished'} successfully`});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 
/////////////// delete comment (admin)
exports.deleteComment = async (req, res) => {
    const { eventId, commentId } = req.body; // Retrieve eventId and commentId from URL params

    try {
        // Find the event by eventId
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Remove the comment from the event's comments array
        event.comments = event.comments.filter(comment => comment._id.toString() !== commentId);

        // Save the updated event (without the deleted comment)
        await event.save();

        // Return success message or status
        res.status(201).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 

////////////////////////////////////////////////////////////////
exports.eventCategory = async(req, res, next) => {
    const {name, slug, image, featuredCategory, description, isPublished} = req.body
    try {
        const requiredFields = { name, slug, description };
        const missingField = Object.keys(requiredFields).find(key => !requiredFields[key]);

        if (missingField) {
            return res.status(400).json({ success: false, message: `${missingField} is missing` });
        }
        
        const sanitizedSlug = slug.replace(/\s+/g, '-').toLowerCase();
        const newEventCategory = new EventCategory({
            name,
            slug: sanitizedSlug,
            image,
            featuredCategory,
            description,
            isPublished
        })

        const savedEventCategory = await newEventCategory.save();
        if (!savedEventCategory) {
            return res.status(400).json({ success: false, message: "Event Category not saved" });
        }

        res.status(200).json({ success: true, message: "Event Category successfully added", data: savedEventCategory });
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getEventCategory = async(req, res, next) => {
    try {
        const eventCategory = await EventCategory.findById(req.body.id)
        if(!eventCategory){
            return res.status(404).json({ success: false, message: "Event Category not found" });
        }
        res.status(200).json({ success: true, eventCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}

exports.getAllEventCategory = async(req, res, next) => {
    try {
        const eventCategory = await EventCategory.find({isPublished: true})
        if(!eventCategory){
            return res.status(404).json({ success: false, message: "Event Category not found" });
        }
        res.status(200).json({ success: true, eventCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}
exports.eventFilterCategory = async(req, res, next) => {
    const { category } = req.body
    try {
        const eventCategory = await EventCategory.find({category})
        if(!eventCategory){
            return res.status(404).json({ success: false, message: "Event Category not found" });
        }
        res.status(200).json({ success: true, eventCategory })
    } catch (error) {
        res.status(200).json({ success: false, message: "Internal Server Error" });
    }
}