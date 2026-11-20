const Media = require("../models/Media");
const { deleteFromCloudinary } = require("../config/cloudinary");

const MEDIA_TYPES = ["image", "video"];

/*
|--------------------------------------------------------------------------
| Helper: media type of an uploaded file ("image" | "video" | null)
|--------------------------------------------------------------------------
*/
const getFileType = (file) => {
  if (!file) return null;
  if (file.mimetype.startsWith("video/")) return "video";
  if (file.mimetype.startsWith("image/")) return "image";
  return null;
};

/*
|--------------------------------------------------------------------------
| Get All Media
|--------------------------------------------------------------------------
*/
exports.getMedia = async (req, res) => {
  try {
    const mediaItems = await Media.find().sort({ createdAt: -1 });

    res.status(200).json(mediaItems);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Media By ID
|--------------------------------------------------------------------------
*/
exports.getMediaById = async (req, res) => {
  const { id } = req.params;

  try {
    const mediaItem = await Media.findById(id);

    if (!mediaItem) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    res.status(200).json(mediaItem);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Media
|--------------------------------------------------------------------------
*/
exports.createMedia = async (req, res) => {
  const { title, category, type, description } = req.body;

  try {
    /*
    | Validate required fields
    */

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (!type) {
      return res.status(400).json({
        message: "Type is required (image or video)",
      });
    }

    if (!MEDIA_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'image' or 'video'",
      });
    }

    /*
    | Check uploaded file
    */

    if (!req.file) {
      return res.status(400).json({
        message: `A ${type} file is required`,
      });
    }

    /*
    | The uploaded file must match the selected type
    */

    if (getFileType(req.file) !== type) {
      return res.status(400).json({
        message: `Selected type is '${type}' but the uploaded file is not a ${type}`,
      });
    }

    /*
    | Create Media (url = Cloudinary URL)
    */

    const newMedia = new Media({
      title,
      category,
      type,
      description,
      url: req.file.path,
    });

    const savedMedia = await newMedia.save();

    res.status(201).json({
      message: "Media created successfully",
      data: savedMedia,
    });
  } catch (error) {
    console.error("Create media error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Media
|--------------------------------------------------------------------------
*/
exports.updateMedia = async (req, res) => {
  const { id } = req.params;
  const { title, category, type, description } = req.body;

  try {
    /*
    | Find existing media
    */

    const existingMedia = await Media.findById(id);

    if (!existingMedia) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    /*
    | Validate type (if provided)
    */

    if (type !== undefined && !MEDIA_TYPES.includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'image' or 'video'",
      });
    }

    const newType = type !== undefined ? type : existingMedia.type;
    const oldUrl = existingMedia.url; // used to remove the old file after a replacement

    if (req.file) {
      // New file must match the selected type
      if (getFileType(req.file) !== newType) {
        return res.status(400).json({
          message: `Selected type is '${newType}' but the uploaded file is not a ${newType}`,
        });
      }

      existingMedia.url = req.file.path;
    } else if (newType !== existingMedia.type) {
      // Type changed but no file to back it up
      return res.status(400).json({
        message: `Upload a new ${newType} file to change the type`,
      });
    }

    existingMedia.type = newType;

    /*
    | Update text fields
    */

    if (title !== undefined) {
      existingMedia.title = title;
    }

    if (category !== undefined) {
      existingMedia.category = category;
    }

    if (description !== undefined) {
      existingMedia.description = description;
    }

    const updatedMedia = await existingMedia.save();

    // New file saved successfully, so remove the old one from Cloudinary
    if (req.file && oldUrl && oldUrl !== updatedMedia.url) {
      await deleteFromCloudinary(oldUrl);
    }

    res.status(200).json({
      message: "Media updated successfully",
      data: updatedMedia,
    });
  } catch (error) {
    console.error("Update media error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Media
|--------------------------------------------------------------------------
*/
exports.deleteMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMedia = await Media.findByIdAndDelete(id);

    if (!deletedMedia) {
      return res.status(404).json({
        message: "Media not found",
      });
    }

    // Remove the file from Cloudinary (images and videos)
    await deleteFromCloudinary(deletedMedia.url);

    res.status(200).json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};