const fbAuthOptions = {
    clientID: '<fb client id>',
    clientSecret: '<fb client secret>',
    profileFields: ['id', 'displayName', 'photos', 'email']
};

const googleAuthOptions = {
    clientID: '<google client id>',
    clientSecret: '<google client secret',
};

const dbConfig = {
    host: process.env.db_host || 'localhost',
    database: process.env.db_name || 'api_framework_db',
    user: process.env.db_user || 'postgres',
    password: process.env.db_password || 'postgres'
}

module.exports = {
    google: googleAuthOptions,
    fb: fbAuthOptions,
    db: dbConfig
}