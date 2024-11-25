const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');


const staticMiddleware = (app) => {
    // define directory where images are stored
    const imageDirectory = path.join(__dirname, '../public/images');

    // set up a static route to serve images from the 'public/images' folder
    app.use('/images', express.static(imageDirectory));

    // Handle GET requests for specific images by their name
    app.get('/images/:imageName', (req, res, next) => {
        const { imageName } = req.params;
        const imagePath = path.join(imageDirectory, imageName);

        fs.exists(imagePath, (exists) => {
            if (!exists) {
                // If the image does not exist, log an error 
                logger.error(`Image not found: ${imageName}`);
                return res.status(404).json({ error: 'Image not found' });
            }
            // If the image exists, send the image file as the response
            res.sendFile(imagePath);
        });
    });
};

module.exports = staticMiddleware;
