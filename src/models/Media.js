const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Bus Advertising",
        "Digital Advertising",
        "Outdoor Advertising",
        "Restaurant Advertising",
        "Events",
        "Branding",
        "Client Campaigns",
        "Projects",
        "Testimonials",
        "Company",
        "Announcements",
        "Other"
      ],
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    url: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Media", mediaSchema);