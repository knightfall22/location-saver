const mongoose = require('mongoose'),
      validator = require('validator'),
            jwt = require('jsonwebtoken'),
         bcyrpt = require('bcryptjs'),
              _ = require('lodash');

const UserShema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:1,
        unique:true,
        minlength:1,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    tokens:[{
        access:{
            type: String,
            required:true

        },
        token:{
            type: String,
            required:true
        }
    }]
});

UserShema.methods.toJSON = function () {
    let user = this,
    userObject = user.toObject();

    return _.pick(userObject,['_id','email']);
}

UserShema.methods.removeToken = function (token) {
   let user = this;
   return user.update({
       $pull:{
            tokens:{token}    
       }
   }) 
}

UserShema.methods.generateAuthToken = function () {
    let user = this,
      access = 'auth',
      token = jwt.sign({_id:user._id.toHexString(),access},'abc1234').toString();
      user.tokens.push({access,token});

      return user.save().then(() => {
          return token;
      })
}

UserShema.statics.findByToken = function (token) {
    let User = this,
    decode;
    try {
        decode = jwt.verify(token,'abc1234')
    } catch (e) {
      return Promise.reject();  
    }
    
    return User.findOne({
        '_id': decode._id,
        'tokens.token':token,
        'tokens.access': decode.access
    })
    
}

UserShema.statics.findByCredentials = function (email,password) {
    let User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
             return Promise.reject() 
        }

        return new Promise((resolve,reject) => {
            bcyrpt.compare(password,user.password,(err,res) => {
                if (res) {
                    return resolve(user);
                }
                    return reject();
                
            })
        })
    })

}

//Encrpting password
UserShema.pre('save',function (next) {
    let user = this;
    if (user.isModified('password')) {
        bcyrpt.genSalt(10,(err,salt) => {
            bcyrpt.hash(user.password,salt,(err,hash) => {
                user.password = hash;
                next();
            })
        })
    }else{
        next()
    }
})

let User = mongoose.model('User',UserShema);


module.exports = {User}