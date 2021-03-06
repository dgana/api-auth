const models = require('../models');
var passwordHash = require('password-hash');
var expressJWT = require('express-jwt')
var jwt = require('jsonwebtoken');
const config = require('../config')

module.exports = {
  userSignin: function(req, res, next) {
    if(!req.body.username){
      res.status(400).send('username required');
      return;
    }
    if(!req.body.password){
      res.status(400).send('password required');
      return;
    }

    models.Users.find({where:{username: req.body.username}}).then(function (user){
      if (!passwordHash.verify(req.body.password, user.password)) {
        res.send("Invalid Password")
      } else {
        let myToken = jwt.sign({id: user.id, role: user.role}, 'secret', { expiresIn: '1h' });
        console.log(user.role, user.id, user.username);
        res.json(myToken);
        // res.send(user.role)
      }
    });
  },
  createUser: function(req, res, next) {
    models.Users.create({
      username: req.body.username,
      password: passwordHash.generate(req.body.password),
      role: req.body.role
    }).then((data) => {
      res.send(data)
    })
  },
  getUser: function(req, res, next) {
    models.Users.findById(req.params.id).then(function (data) {
      res.send({users: data})
    })
  },
  getUsers: function(req, res, next) {
    models.Users.findAll().then(function(data){
      res.send({users: data})
    })
  },
  deleteUser: function(req, res, next) {
    models.Users.destroy({
      where: {
        id: req.params.id
      }
    }).then((data) => {
      res.send({message: `User with id ${req.params.id} has been deleted`})
    })
  },
  updateUser: function(req, res, next) {
    models.Users.findById(req.params.id).then(function (data) {
      data.update({
        username: req.body.username,
        password: passwordHash.generate(req.body.password),
        role: req.body.role
      })
    }).then((data) => {
      res.send({message: `User with id ${req.params.id} has been updated`})
    })
  },
  verify: function(req, res, next){
    var decoded = jwt.verify(req.header('auth'), 'secret');
    if(decoded && decoded.role === "admin") {
      next()
    } else {
      res.send("You don't have access!")
    }
  }
};

// passwordHash.verify(req.body.password, data.password)
