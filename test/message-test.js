const Models = require('../models');

function sleep(ms) {
    return new Promise(async (resolve, reject) => {
      console.log('sleeping ' + ms + ' ms');
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  
var user1;
var user2;

function start() {
    return new Promise(async (resolve, reject) => {
        await sleep(2000);
        Models.User.create({email: 'rob@rob.com'})
        .then (user => {
            user1 = user;
            Models.User.create({email: 'joe@joe.com'})
            .then (user => {
                user2 = user;
                Models.Message.create({
                    text: 'hello joe',
                    recipient: user2.id,
                    sender: user1.id
                })
                .then (message => {
                    console.log(message);
                    user1.getSentMessages()
                    .then(sent => {
                        user1.getReceivedMessages()
                        .then(received => {
                            console.log('user1 received' + received);
                            console.log('user1 sent' + sent);
                            debugger
                            user2.getSentMessages()
                            .then(sent => {
                                user2.getReceivedMessages()
                                .then(received => {
                                    console.log('user2 received' + received);
                                    console.log('user2 sent' + sent);
                                    debugger
                                });
                            });
                        })

                    })
                })
            })
        })
    })

}


start();