const Sequelize = require('sequelize');
const config = require('./config').db;
const bcrypt = require('bcryptjs');
const db = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
});

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
              user = user.get({ plain: true });
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
  text: Sequelize.TEXT
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

db.sync({ force: true });

console.log('Connected to database ' + config.database + ' on ' + config.host + ' as user ' + config.user)

module.exports = {
  db: db,
  User: User,
  Message: Message
}
