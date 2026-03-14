const Client = require('../models/Client');
const { deleteFromCloudinary } = require('../config/cloudinary');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Success',
            data: clients
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }
        res.status(200).json({
            message: 'Success',
            data: client
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createClient = async (req, res) => {
    try {
        const { name } = req.body;
        const clientData = { name };
        
        if (req.file) {
            clientData.logo = req.file.path;
        } else {
            return res.status(400).json({
                message: 'Validation Error',
                error: 'Please add a client logo'
            });
        }

        const client = await Client.create(clientData);
        res.status(201).json({
            message: 'Client created',
            data: client
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

exports.updateClient = async (req, res) => {
    try {
        const { name } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;

        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        if (req.file) {
            // Delete old logo from Cloudinary if it exists
            if (client.logo) {
                await deleteFromCloudinary(client.logo);
            }
            updateData.logo = req.file.path;
        }

        const updatedClient = await Client.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            message: 'Client updated',
            data: updatedClient
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        // Delete logo from Cloudinary
        if (client.logo) {
            await deleteFromCloudinary(client.logo);
        }

        await Client.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Client deleted',
            id: req.params.id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};
