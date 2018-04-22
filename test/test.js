var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();
var Models = require('../models');

chai.use(chaiHttp);
const api = chai.request.agent(app)


const testUser = {
  email: 'rob@rob.com',
  password: 'hello',
  first_name: "Rob",
  last_name: "User",
  address: "1234 Main St, Anytown, Ca, 91111",
  phone_number: "555-555-5555",
  image: ''
}

const testUser2 = {
  email: 'joe@rob.com',
  password: 'hello',
  first_name: "Joe",
  last_name: "User",
  address: "12345 Main St, Anytown, Ca, 91111",
  phone_number: "555-555-5555",
  image: ''
}

var user = null;
var user1 = null;
var user2 = null;



function sleep(ms) {
  return new Promise(async (resolve, reject) => {
    console.log('sleeping ' + ms + ' ms');
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

before(async function () {
  this.timeout(15000);
  await sleep(10000)
  console.log('Clearing DB');
  await Models.db.sync()
  await Models.User.destroy({ truncate: true, cascade: true })
  await Models.Message.destroy({ truncate: true, cascade: true })
  console.log('Cleared DB');
});

after(function () {
  api.close()
})

describe('Create a new user with a password', function () {
  it('should create a new user with a password', function (done) {
    api
      .post('/api/signup')
      .send(testUser)
      .end(function (err, res) {
        console.log('Response Body:\n', res.body);
        user1 = res.body;
        res.should.have.status(200);
        done();
      });
  });

  it('should create a new user with a password', function (done) {
    api
      .post('/api/signup')
      .send(testUser2)
      .end(function (err, res) {
        console.log('Response Body:\n', res.body);
        user2 = res.body;
        res.should.have.status(200);
        done();
      });
  });
})


describe('Log in as user', function () {

  it('should reject a login with an unknown user', function (done) {
    api
      .post('/api/login')
      .send({ email: 'xxxxxxxxxx', password: testUser.password })
      .end(function (err, res) {
        user = res.body;
        console.log('====================== Response Body:\n', user);
        res.should.have.status(401);
        done();
      });
  })

  it('should reject a known user with an invalid password', function (done) {
    api
      .post('/api/login')
      .send({ email: testUser.email, password: 'xxxxxxxxx' })
      .end(function (err, res) {
        user = res.body;
        console.log('====================== Response Body:\n', user);
        res.should.have.status(401);
        done();
      });
  })

  it('should login as an existing user with a password', function (done) {
    api
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password })
      .end(function (err, res) {
        user = res.body;
        console.log('====================== Response Body:\n', user);
        res.should.have.status(200);
        done();
      });
  })

  it('should update a SINGLE user on /users/:userId', function (done) {
    api
      .put('/api/users/' + user.id)
      .send({
        'first_name': 'Eric',
        'last_name': 'Gelencser'
      })
      .end(function (error, response) {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.first_name.should.equal('Eric')
        response.body.last_name.should.equal('Gelencser')
        done();
      });
  });
});
