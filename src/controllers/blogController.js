const Blog = require('../models/Blog');
const { cloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.status(200).json({
            message: 'Success',
            data: blogs
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            });
        }
        res.status(200).json({
            message: 'Success',
            data: blog
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createBlog = async (req, res) => {
    try {
        console.log('Create Blog Request Body:', req.body);
        console.log('Create Blog Request File:', req.file);

        const blogData = req.body;
        if (req.file) {
            blogData.image = req.file.path;
        }

        const blog = await Blog.create(blogData);
        res.status(201).json({
            message: 'Blog created',
            data: blog
        });
    } catch (error) {
        console.error('Create Blog Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                message: 'Validation Error',
                error: messages
            });
        }
        res.status(500).json({
            message: 'Server Error',
            error: error.message,
            errorName: error.name,
            stack: error.stack
        });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const { title, content, Excerpt } = req.body;
        const updateData = {};

        if (title !== undefined && title.trim() !== '') updateData.title = title;
        if (content !== undefined && content.trim() !== '') updateData.content = content;
        if (Excerpt !== undefined && Excerpt.trim() !== '') updateData.Excerpt = Excerpt;

        // Find blog first to get old image path
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            });
        }

        if (req.file) {
            // Delete old image from Cloudinary
            await deleteFromCloudinary(blog.image);
            updateData.image = req.file.path;
        }

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            message: 'Blog updated',
            data: updatedBlog
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: 'Blog not found'
            });
        }

        // Delete image from Cloudinary
        await deleteFromCloudinary(blog.image);

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: 'Blog deleted',
            id: req.params.id
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};
