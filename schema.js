const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        // *** FIXED IMAGE SCHEMA FOR EDITING ***
        image: Joi.object({
            url: Joi.string().required(),
            filename: Joi.string().required()
        }).optional() // Changed from .required() to .optional()
        // This allows editing without providing a new image
        // ***************************************
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});