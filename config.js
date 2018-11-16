const fbAuthOptions = {
    clientID: process.env.FB_CLIENT_ID || 'xxx', 
    clientSecret: process.env.FB_CLIENT_SECRET || 'xxx',
    profileFields: ['id', 'displayName', 'photos', 'email']
};

const googleAuthOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID || 'xxx',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'xxx',
};

const dbConfig = {
    dbUrl: process.env.DATABASE_URL || null, // Use a url if available
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'test',
    user: process.env.POSTGRES_USER|| 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres'
}

const config = { 
    google: googleAuthOptions,
    fb: fbAuthOptions,
    db: dbConfig
}

console.log("Using configuration settings: " + JSON.stringify(config, null, 2))
module.exports = config;