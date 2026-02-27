const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'billford-ads',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    },
});

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        const parts = imageUrl.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1) {
            const publicId = parts.slice(uploadIndex + 2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

module.exports = { cloudinary, storage, deleteFromCloudinary };
