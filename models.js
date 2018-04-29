const Sequelize = require('sequelize');
const config = require('./config').db;
const bcrypt = require('bcryptjs');
const dbOptions = {
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
}

let db = null;
if (config.dbUrl) {
  db = new Sequelize(config.dbUrl, dbOptions);
} else {
  dbOptions.host = config.host;
  db = new Sequelize(config.database, config.user, config.password, dbOptions);
}

const User = db.define('user', {
  first_name: Sequelize.STRING,
  last_name: Sequelize.STRING,
  address: Sequelize.STRING,
  phone_number: Sequelize.STRING,
  image: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: Sequelize.STRING,
  fb_id: Sequelize.STRING,
  google_id: Sequelize.STRING,
});


User.createWithHash = function (userData) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(userData.password, bcrypt.genSaltSync(12))
      .then(passHash => {
        userData.password = passHash;
        User.findOrCreate({
          where: {
            email: userData.email
          },
          defaults: userData
        })
          .spread((user, created) => {
            if (created) {
              user = user.get({plain: true});
              delete user.password;
              resolve(user);
            } else reject('Email already exists')
          })
      })
      .catch(err => {
        reject(err);
      })
  });
}

User.Instance.prototype.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
}

const Message = db.define('message', {
  content: Sequelize.TEXT,
});

User.hasMany(Message, {
  as: 'receivedMessages',
  foreignKey: 'recipient',
  otherKey: 'userId'
});

User.hasMany(Message, {
  as: 'sentMessages',
  foreignKey: 'sender',
  otherKey: 'userId'
})

db.sync()
  .then(db => {
    console.log('Connected to database ' + db.config.database + ' on ' + db.config.host + ' as user ' + db.config.username)
  })
  .catch(err => {
    console.error(err);
  });


module.exports = {
  db: db,
  User: User,
  Message: Message
}
