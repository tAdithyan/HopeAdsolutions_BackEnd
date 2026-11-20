const express = require("express");
const router = express.Router();

const mediaController = require("../controllers/mediaController");
const upload = require("../middlewares/upload");

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media management
 */

/**
 * @swagger
 * /media:
 *   get:
 *     summary: Retrieve all media
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: A list of media
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 */
router.get("/", mediaController.getMedia);

/**
 * @swagger
 * /media/{id}:
 *   get:
 *     summary: Get media by ID
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The media ID
 *     responses:
 *       200:
 *         description: Media details
 *       404:
 *         description: Media not found
 */
router.get("/:id", mediaController.getMediaById);

/**
 * @swagger
 * /media:
 *   post:
 *     summary: Create a new media item
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - type
 *               - media
 *           properties:
 *             title:
 *               type: string
 *               example: Bus Advertising Campaign
 *             category:
 *               type: string
 *               enum:
 *                 - Bus Advertising
 *                 - Digital Advertising
 *                 - Outdoor Advertising
 *                 - Restaurant Advertising
 *                 - Events
 *                 - Branding
 *                 - Client Campaigns
 *                 - Projects
 *                 - Testimonials
 *                 - Company
 *                 - Announcements
 *                 - Other
 *             type:
 *               type: string
 *               enum:
 *                 - image
 *                 - video
 *             description:
 *               type: string
 *             media:
 *               type: string
 *               format: binary
 *     responses:
 *       201:
 *         description: Media created successfully
 *       400:
 *         description: Invalid media data
 */
router.post(
  "/",
  upload.single("media"),
  mediaController.createMedia
);

/**
 * @swagger
 * /media/{id}:
 *   put:
 *     summary: Update a media item
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The media ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum:
 *                   - Bus Advertising
 *                   - Digital Advertising
 *                   - Outdoor Advertising
 *                   - Restaurant Advertising
 *                   - Events
 *                   - Branding
 *                   - Client Campaigns
 *                   - Projects
 *                   - Testimonials
 *                   - Company
 *                   - Announcements
 *                   - Other
 *               type:
 *                 type: string
 *                 enum:
 *                   - image
 *                   - video
 *               description:
 *                 type: string
 *               media:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Media updated successfully
 *       404:
 *         description: Media not found
 */
router.put(
  "/:id",
  upload.single("media"),
  mediaController.updateMedia
);

/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     summary: Delete a media item
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The media ID
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 */
router.delete("/:id", mediaController.deleteMedia);

module.exports = router;
