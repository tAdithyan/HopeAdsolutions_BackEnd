const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_FORMATS = ['jpg', 'png', 'jpeg', 'webp', 'gif'];
const VIDEO_FORMATS = ['mp4', 'mov', 'webm'];

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video/');

        if (isVideo) {
            return {
                folder: 'Hopeadsolutions-ads',
                // Without resource_type "video" Cloudinary treats the file as an
                // image and rejects it: "Image file format mp4 not allowed"
                resource_type: 'video',
                allowed_formats: VIDEO_FORMATS,
            };
        }

        return {
            folder: 'Hopeadsolutions-ads',
            resource_type: 'image',
            allowed_formats: IMAGE_FORMATS,
            // Resize only images, never videos
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        };
    },
});

const deleteFromCloudinary = async (mediaUrl) => {
    if (!mediaUrl) return;
    try {
        const parts = mediaUrl.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1) {
            const publicId = parts
                .slice(uploadIndex + 2)
                .join('/')
                .replace(/\.[^/.]+$/, ''); // strip only the file extension

            // Videos must be destroyed with resource_type "video"
            const resourceType = mediaUrl.includes('/video/upload/')
                ? 'video'
                : 'image';

            await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });
        }
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
    }
};

module.exports = { cloudinary, storage, deleteFromCloudinary };