const fs = require('fs');
const express = require('express');
const router = express.Router();
const path = require('path');
const resourceDir = './';
const self = path.basename(__filename);
const register = require('../../utils/routes').register;


/**
 * Load all files in this directory as resource routes
 */
function apiRoutes() {
    let resourceFiles = fs.readdirSync(path.join(__dirname, resourceDir));
    resourceFiles.forEach(file => {
        if (file !== self) {
            let route = '/' + path.basename(file, '.js');
            let resourceFile = './' + path.join(resourceDir, file);
            let resource = require(resourceFile);
            if (resource.isPrivate) router.use(route, isLoggedIn, resource.router);
            else router.use(route, resource.router);
            register(route, resource.router);
        }
    })
    return router;
}

function isLoggedIn(req, res, next) {
    if (req.user) return next()
    else return res.status(401).json('Not Authenticated');
}

module.exports = apiRoutes();