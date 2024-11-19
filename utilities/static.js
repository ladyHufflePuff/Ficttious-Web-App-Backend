const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');


const staticMiddleware = (app) => {
    const imageDirectory = path.join(__dirname, '../public/images');

    app.use('/images', express.static(imageDirectory));

    app.get('/images/:imageName', (req, res, next) => {
        const { imageName } = req.params;
        const imagePath = path.join(imageDirectory, imageName);

        fs.exists(imagePath, (exists) => {
            if (!exists) {
                logger.error(`Image not found: ${imageName}`);
                return res.status(404).json({ error: 'Image not found' });
            }
            res.sendFile(imagePath);
        });
    });
};

module.exports = staticMiddleware;
