//3rd party variables
const express = require('express'),
   bodyParser = require('body-parser'),
   {ObjectId} = require('mongodb'),
           _  = require('lodash');

//Local variables
const {mongoose} = require('../db/mongoose'),
      {Location} = require('./models/location'),
          {User} = require('./models/user'),
  {authenticate} = require('./authenticate/authenticate');

//BASIC SET UP
let app = express(),
   port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/location',authenticate,(req,res) => {
    let local = new Location({
        name: req.body.name,
        description: req.body.description,
        creator:req.user._id
    });

    local.save().then((location) => {
        res.send(location)
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.get('/location',authenticate,(req,res) => {
    Location.find({
        creator:req.user._id
    }).then((location) => {
        res.send({location})
    }).catch((e) => {
        res.status(400).send(e);
    })
});

app.get('/location/:_id',authenticate,(req,res) => {
    let id = req.params._id;
    if (!ObjectId.isValid(id)) {
       return res.status(404).send();
    }

    Location.findOne({
        creator:req.user._id,
        _id:id
    }).then((location) => {
        if(!location){
          return res.status(404).send();
        }
        res.send({location})
    },(e) => {
        return res.status(400)
    })
})

app.delete('/location/:_id',authenticate,(req,res) => {
    let id = req.params._id;
    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Location.findOneAndRemove({
        _id:id,
        creator:req.user._id
    }).then((location) => {
      if (!location) {
         return res.status(404).send(); 
      } 
      res.send(location) 
    }).catch((e) => res.status(400))
})

app.patch('/location/:_id',authenticate,(req,res) => {
    let id = req.params._id;
    let body = _.pick(req.body,['name','description']);

    if (!ObjectId.isValid(id)) {
        return res.status(404).send();
    }

    Location.findOneAndUpdate({creator:req.user._id,_id:id},{$set:body},{new:true}).then((location) => {
        if (!location) {
          return res.status(404).send()
        }

    res.send({location})  
        console.log(location);
        
    }).catch((e) => {
        res.send(e).status(400)
    })


});

//USERS



app.post('/users',(req,res) => {
    let body = _.pick(req.body,['email','password']);

    let user = new User(body)

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth',token).send(user)
    }).catch((e) => {
        res.status(400).send(e)
    })
})


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login',(req,res) => {
    let body = _.pick(req.body,['email','password']);

    User.findByCredentials(body.email,body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => res.status(400).send(e))
});

app.delete('/users/logout',authenticate,(req,res) => {
    req.user.removeToken(req.token).then(() => {
          res.status(200).send();
    }).catch((e) => res.status(400).send());
})


app.listen(port,() => {
    console.log(`Api started on ${port}`);
});

module.exports = {app}