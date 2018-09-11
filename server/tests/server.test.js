let {mongoose} = require('../../db/mongoose'),
       request = require('supertest'),
        expect = require('expect'), 
    {Location} = require('../models/location'),
       {User}  = require('../models/user'),
    {ObjectId} = require('mongodb'),
        {app}  = require('../server'),
    {Locations,populateLocation,Users,populateUsers} = require('./seed/seed');

beforeEach(populateLocation);
beforeEach(populateUsers);

describe('POST /location',() => {
    it('Should create a new location',(done) => {
        var local = {name:'apata',description:'blah blah'}
        request(app)
            .post('/location')
            .send(local)
            .set('x-auth',Users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject(local);
            })
            .end((err,res) => {
                if (err) {
                    return done(err)
                }

                Location.find(local).then((location) => {
                    expect(location.length).toBe(1);
                    expect(location[0]).toMatchObject(local);
                    done();
                }).catch((e) => {
                    done(e);
                })
            })
    });

    it('Should fail without valid body data',(done) => {
        request(app)
            .post('/location')
            .send({})
            .expect(400)
            .set('x-auth', Users[0].tokens[0].token)
            .end((err,res) => {
                if(err){
                    return done(err);
                }

                Location.find().then((location) => {
                    expect(location.length).toBe(2);
                    done();
                }).catch((e) => {
                    done(e);
                })
            })
    })
})

describe('GET /location',() => {
    it('Should display all locations',(done) => {
        request(app)
            .get('/location')
            .set('x-auth', Users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.location.length).toBe(1)
            })
            .end(done)
    })
});

describe('GET /location/:_id',() => {
    it('Should display specific location',(done) => {
        request(app)
            .get(`/location/${Locations[0]._id.toHexString()}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
               expect(res.body.location.name).toBe(Locations[0].name)
               
            })
            .end(done)
    });
    it('Should not display other users location', (done) => {
        request(app)
            .get(`/location/${Locations[0]._id.toHexString()}`)
            .set('x-auth', Users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('Should give 404 when objectId is not valid',(done) => {
        request(app)
            .get(`/location/${123}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done) 
    });

    it('Should give 404 when location is not found',(done) => {
        let _id = new ObjectId();
        request(app)
            .get(`/location/${_id.toHexString()}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done) 
    })
})

describe('DELETE /location/:_id',() => {
    it('Should delete Location',(done) => {
        let _id = Locations[0]._id;
        request(app)
            .delete(`/location/${_id.toHexString()}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(Locations[0].name);
            })
            .end((err,res) => {
                if (err) {
                   return done(err);
                }

                Location.findById(_id).then((location) => {
                    expect(location).toNotExist;
                    done();
                }).catch((e) => {
                    done(e);
                })
            })
    });

    it('Should not delete other users Location',(done) => {
        let _id = Locations[0]._id;
        request(app)
            .delete(`/location/${_id.toHexString()}`)
            .set('x-auth', Users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });

    it(`Should not delete if Id is not valid`,(done) => {
        request(app)
            .delete(`/location/${123}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
    
    it(`Should not delete if Id is not found valid`,(done) => {
        let id = new ObjectId();
        request(app)
            .delete(`/location/${id.toHexString()}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
});

describe('PATCH /location/:_id',() => {
    it('Should Update location',(done) => {
        let id = Locations[0]._id.toHexString();
        let local = {name:'Shoppping mall',description:'place to shop'}
        request(app)
            .patch(`/location/${id}`)
            .set('x-auth', Users[0].tokens[0].token)
            .send(local)
            .expect((res) => {
                expect(res.body.location).toMatchObject(local)
            })
            .expect(200)
            .end(done)
    })

    it('Should not Update other users location',(done) => {
        let id = Locations[0]._id.toHexString();
        let local = {name:'Shoppping mall',description:'place to shop'}
        request(app)
            .patch(`/location/${id}`)
            .set('x-auth', Users[1].tokens[0].token)
            .send(local)
            .expect(404)
            .end(done)
    })

    it('Should return 404 if id is in-valid',(done) => {
        request(app)
            .patch(`/location/${1234}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('Should return 404 if id is not found',(done) => {
        let id = new ObjectId().toHexString();
        request(app)
            .patch(`/location/${id}`)
            .set('x-auth', Users[0].tokens[0].token)
            .expect(404)
            .end(done)
    })
})

describe('POST /users',() => {
    it('Should create new users',(done) => {
        let email = 'email@example.com',
         password = 'testpassword';
        request(app)
            .post('/users')
            .send({email,password})
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body.email).toBe(email);
                expect(res.body._id).toBeTruthy();
            })
            .expect(200)
            .end((err,res) => {
                if (err) {
                   return done(err); 
                }

                User.findOne({email}).then((user) => {
                    expect(user.password).not.toBe(password);
                    done();
                })
            })
    });

    it('Should give 400 if in-valid data is passed',(done) => {
        let email = ']]]]].com',
         password = true;
         request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end(done)
    });

    it('Should not create user if email is in use',(done) => {
        let email = Users[0].email,
         password = 'Blah';
        
        request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end(done)
    })
});

describe('GET /users/me',() => {
    it('Should return a users if auth',(done) => {
        let token = Users[0].tokens[0].token;
        request(app)
            .get('/users/me')
            .set('x-auth',token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(Users[0]._id.toHexString());
                expect(res.body.email).toBe(Users[0].email)
            })
            .end(done)
    });

    it('Should not return user if not auth',(done) => {
        request(app)
            .get('/users/me')
            .expect((res) => {
                expect(res.empty).toBeEmpty;
            })
            .expect(401)
            .end(done)
    })
})

describe('POST /users/login',() => {
    it('Should log existing user in',(done) => {
        let email = Users[0].email,
         password = Users[0].password;
        request(app)
         .post('/users/login')
         .expect(200)
         .send({email,password})
         .expect((res) => {
             expect(res.header['x-auth']).toBeTruthy()
         })
         .end((err,res) => {
             if (err) {
                return done(err)
             }

             User.findById(Users[0]._id).then((user) => {
                 expect(user.token[0]).toMatchObject({
                     access:'auth',
                     token:res.header['x-auth']
                 });
                 done();
             }).catch((e) => done());
         })
    })
    it('Should not login invalid with data',(done) => {
        let email = Users[0].email,
         password = '1223eee';
        request(app)
         .post('/users/login')
         .send({email,password})
         .expect(400)
         .expect((res) => {
             expect(res.header['x-auth']).toBeFalsy();
         })
        .end((err,res) => {
             if (err) {
                return done(err)
             }

             User.findById(Users[0]._id).then((user) => {
                 expect(user.token[0]).length(1)
                 done();
             }).catch((e) => done());
         })
    })
})

describe('DELETE /users/logout',() => {
    it('Should remove header',(done) => {
        let header = Users[0].tokens[0].token;
        request(app)
            .delete('/users/logout')
            .set('x-auth',header)
            .expect(200)
            .end((err,res) => {
                if (err) {
                   return done(err) 
                }

                User.findById(Users[0]._id).then((user) =>{
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done())
            })
    })
})
