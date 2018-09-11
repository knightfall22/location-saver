let {ObjectId} = require('mongodb'),
    {mongoose} = require('../../../db/mongoose'),
    {Location} = require('../../models/location'),
       {User} = require('../../models/user'),
          jwt = require('jsonwebtoken');

let userOneId = new ObjectId(),
    userTwoId =  new ObjectId();

const Users = [
    {
        _id:userOneId,
        email:'pelumi077@gmail.com',
        password: 'userOnePass',
        tokens : [{
            access: 'auth',
            token: jwt.sign({_id:userOneId.toHexString(), access:'auth'},'abc1234').toString()
        }]
    },
    {
        _id:userTwoId,
        email:'pelumi067@gmail.com',
        password: 'userTwoPass',
        tokens : [{
            access: 'auth',
            token: jwt.sign({_id:userTwoId.toHexString(), access:'auth'},'abc1234').toString()
        }]
    }

]
 
const Locations = [
    {
        _id: new ObjectId(),
        creator: userOneId,
        name: 'Challenge,ibadan',
        description: 'A central hub to travel out of ibadan'
    },
    {
        _id: new ObjectId(),
        creator:userTwoId,
        name: 'Challenge Mall',
        description: 'A Place for one stop shopping.... whatever that means'
    }
];

let populateLocation = function (done) {
    this.timeout(20000);
    Location.remove({}).then(() => {
        return Location.insertMany(Locations)
    }).then(() => {
        return done();
    })
}
let populateUsers = function (done) {
    this.timeout(20000);
    User.remove({}).then(() => {
        let userOne = new User(Users[0]).save();
        let userTwo = new User(Users[1]).save();

        return Promise.all([userOne,userTwo])
    }).then(() => done())
}
module.exports = {Locations,populateLocation,Users,populateUsers}