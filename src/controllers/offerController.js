const Offer = require('../models/Offer');
const { cloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.getOffers = async (req, res) => {
    try {
        const offers = await Offer.find();
        res.status(200).json({
            message: 'Success',
            data: offers
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({
                message: 'Offer not found'
            });
        }
        res.status(200).json({
            message: 'Success',
            data: offer
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const offerData = req.body;
        if (req.file) {
            offerData.image = req.file.path;
        }

        const offer = await Offer.create(offerData);
        res.status(201).json({
            message: 'Offer created',
            data: offer
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation Error',
                error: messages
            });
        }
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        console.log('--- Start Update Offer ---');
        console.log('ID:', req.params.id);
        console.log('Body Keys:', Object.keys(req.body));
        console.log('File Info:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            path: req.file.path
        } : 'No file');

        const { headline, subline, description } = req.body;
        const updateData = {};

        if (headline !== undefined) updateData.headline = headline;
        if (subline !== undefined) updateData.subline = subline;
        if (description !== undefined) updateData.description = description;

        console.log('Database Lookup for ID:', req.params.id);
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            console.log('Offer not found');
            return res.status(404).json({
                message: 'Offer not found'
            });
        }

        if (req.file) {
            console.log('Setting new image path:', req.file.path);
            // Delete old image from Cloudinary
            await deleteFromCloudinary(offer.image);
            updateData.image = req.file.path;
        }

        console.log('Applying Update with Data:', JSON.stringify(updateData, null, 2));
        const updatedOffer = await Offer.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        console.log('Update Success');
        res.status(200).json({
            message: 'Offer updated',
            data: updatedOffer
        });
        console.log('--- End Update Offer ---');
    } catch (error) {
        console.error('--- Update Offer Error ---');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        const offerlength = await Offer.countDocuments();
        if (offerlength === 1) {
            return res.status(400).json({
                message: 'Cannot delete last offer'
            });
        }

        if (!offer) {
            return res.status(404).json({
                message: 'Offer not found'
            });
        }

        // Delete image from Cloudinary
        await deleteFromCloudinary(offer.image);

        await Offer.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Offer deleted',
            id: req.params.id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};
