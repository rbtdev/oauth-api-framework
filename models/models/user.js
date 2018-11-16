const Sequelize = require('sequelize');
const Common = require('../common');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

//
// User model
//
module.exports = {

    createModel(db) {
        let User = db.define('user', {
            firstName: Sequelize.STRING,
            lastName: Sequelize.STRING,
            address: Sequelize.STRING,
            phoneNumber: Sequelize.STRING,
            image: Sequelize.STRING,
            bio: Sequelize.STRING,
            email: {
                type: Sequelize.STRING,
                unique: true
            },
            password: Sequelize.STRING,
            fbId: Sequelize.STRING,
            googleId: Sequelize.STRING,
            birthday: Sequelize.STRING,
        });

        //
        // Create a user with a hashed password
        // If user already exists, send back an error
        //
        User.createWithHash = async function (userData) {
            let error = null;
            let user = null;
            try {
                let passHash = await bcrypt.hash(userData.password, bcrypt.genSaltSync(12));
                let newUser = _.cloneDeep(userData);
                newUser.password = passHash;
                [user, created] = await User.findOrCreate({
                    where: {
                        email: userData.email
                    },
                    defaults: newUser
                })
                if (created) {
                    user = user.get({ plain: true });
                    delete user.password;
                } else {
                    error = 'Email already exists';
                    user = null;
                }
            }
            catch (err) {
                error = err;
                user = null;
            }
            return [error, user];
        }

        User.Instance.prototype.validatePassword = function (password) {
            return bcrypt.compare(password, this.password);
        }

        return {
            name: 'User',
            model: User
        }
    },

    createAssociations(db, Models) {}
}