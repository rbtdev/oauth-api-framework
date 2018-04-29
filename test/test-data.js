const Models = require('../models');


async function createData() {
    let users = await addUsers();

    //let messages = await addMessages(users, venues);
    console.log('users ' + users.length);
}

function addUsers() {
    return new Promise( async (resolve, reject) => {
        console.log('=========== Adding Users ==============')
        let userData = [];
        for (let i = 0; i < 100; i++) {
            userData.push({
                first_name: 'first-' + i,
                last_name: 'last-' + i,
                address: 'address-' + i,
                phone_number: 'phone-' + i,
                image: 'image-' + i,
                email: 'email-' + i,
                password: 'password-' + i
            });
        }
        await Models.User.truncate({ cascade: true })
        await Models.User.bulkCreate(userData).catch(reject);
        let users = await Models.User.findAll().catch(reject);
        resolve(users);
    })
}

createData();