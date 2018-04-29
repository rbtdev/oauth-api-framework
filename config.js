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
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
}
module.exports = {
    google: googleAuthOptions,
    fb: fbAuthOptions,
    db: dbConfig
}