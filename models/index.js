const Sequelize = require('sequelize');
const config = require('../config').db;
const fs = require('fs');
const path = require('path');
const MODEL_DIR_NAME = './models'
const MAX_TRIES = 5;
const DB_RETRY_INTERVAL = 1000; // 1 second

async function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms);
    })
}
// 
// Set up database connection
//
const dbOptions = {
    dialect: 'postgres',
    dialectOptions: {
        ssl: config.useSSL
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false,
    logging: (process.env.DB_LOGGING === 'false') ? false : console.log
}

let db = null;
if (config.dbUrl) {
    db = new Sequelize(config.dbUrl, dbOptions);
} else {
    dbOptions.host = config.host;
    db = new Sequelize(config.database, config.user, config.password, dbOptions);
}

function createModels(db) {
    //
    // Import model definitions
    //
    let models = {};
    let modelAssociations = [];
    let modelFiles = fs.readdirSync(path.join(__dirname, MODEL_DIR_NAME));

    // Import models
    modelFiles.forEach(modelFile => {
        console.log(modelFile);
        let modelFileName = path.basename(modelFile, '.js');
        let modelPath = './' + path.join(MODEL_DIR_NAME, modelFileName);
        let modelDef = require(modelPath);
        let model = modelDef.createModel(db);
        modelAssociations.push(modelDef.createAssociations)
        models[model.name] = model.model;
    })

    // Create model associations
    modelAssociations.forEach(create => { create(db, models) });
    return models;
}

//
// Create models and asociations
//
let Models = createModels(db);

// 
// Connect to the database
//
async function connect() {
    let opts = {};
    if (config.forceSync) {
        console.log("DB_FORCE_SYNC is set to 'true'.  Forcing table updates");
        opts.force = true;
    }
    let tries = 0;
    while (tries < MAX_TRIES) {
        try {
            tries++;
            console.log('Connecting to database...');
            let connection = await db.sync(opts);
            console.log('Connected to database ' + connection.config.database + ' on ' + connection.config.host + ' as user ' + connection.config.username);
            return;
        } catch (ex) {
            console.error('Error connecting to database: ' + JSON.stringify(ex));
            console.log(`Re-try database connection in ${DB_RETRY_INTERVAL}ms`);
            await sleep(DB_RETRY_INTERVAL);
        }
    }
    console.error(`Unable to connect to database after ${MAX_TRIES} attemps`);
}

Models.db = db;
Models.connect = connect;
module.exports = Models;
