const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check-auth');
const {registerValidation, loginValidation} = require('../Validation');
const User = require('../module/User');
const router = express.Router();
require('dotenv/config');

//Create a User
router.post('/register', async (req, res) => {
    const {error} = registerValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message);

    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send('Email exists. Try anorher one')

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword
    })
    user.save()
        .then(result => {
            res.status(201).json({
                message: "User Created",
                url: `${req.protocol}://${req.get('host')}/users/${result.id}`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Login a user
router.post('/login', async (req, res) => {
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('No user with givne email');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send("Wrong Password");

    const token = jwt.sign(
        {_id: user.id}, 
        process.env.JWT_TOKEN,
        {expiresIn: "1h"}
    )
    res.status(200).json({
        message: `${user.username} is logged in`,
        token: token
    })
})

//Access user info - Protected
router.get('/:id', checkAuth, (req, res) => {
    User.findById(req.params.id)
        .exec()
        .then(result => {
            res.status(200).json({
                _id: result.id,
                username: result.username,
                email: result.email,
                password: result.password,
                date: result.date,
                all_users: `${req.protocol}://${req.get('host')}/users`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Get all users
router.get('/', (req, res) => {
    User.find()
        .exec()
        .then(users => {
            res.status(200).json({
                count: users.length,
                user: users.map(user => {
                    return {
                        _id: user.id,
                        username: user.username,
                        email: user.email,
                        url: `${req.protocol}://${req.get('host')}/users/${user.id}`
                    }
                })
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Delete a user - Protected
router.delete('/:id', checkAuth, (req, res) => {
    User.remove({_id: req.params.id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted",
                all_users: `${req.protocol}://${req.get('host')}/users`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Update a user - Protected
router.patch('/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const updateUser = {};
    for(const user of req.body){
        updateUser[user.key] = user.value;
    }
    User.update({_id: id}, {$set: updateUser})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User updated",
                url: `${req.protocol}://${req.get('host')}/users/${id}`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

module.exports = router