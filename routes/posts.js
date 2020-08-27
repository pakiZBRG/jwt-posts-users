const express = require('express');
const checkAuth = require('../middleware/check-auth');
const Post = require('../module/Post');
const router = express.Router();

//Get all posts
router.get('/', (req, res) => {
    Post.find()
        .exec()
        .then(posts => {
            res.status(200).json({
                count: posts.length,
                post: posts.map(post => {
                    return {
                        _id: post._id,
                        name: post.name,
                        title: post.title,
                        description: post.description,
                        date: post.date,
                        url: `${req.protocol}://${req.get('host')}/posts/${post.id}`
                    }
                })
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Create a Post - Protected
router.post('/', checkAuth, (req, res) => {
    const post = new Post({
        name: req.body.name,
        title: req.body.title,
        description: req.body.description
    })
    post.save()
        .then(result => {
            res.status(201).json({
                message: "Post Created",
                url: `${req.protocol}://${req.get('host')}/posts/${result.id}`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Get a Post
router.get('/:id', (req ,res) => {
    Post.findById(req.params.id)
        .select('-__v')
        .exec()
        .then(result => {
            res.status(200).json({
                _id: result._id,
                name: result.name,
                title: result.title,
                description: result.description,
                date: result.date,
                all_posts: `${req.protocol}://${req.get('host')}/posts`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Delete a Post - Protected
router.delete('/:id', checkAuth, (req, res) => {
    Post.remove({_id: req.params.id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Post Deleted",
                all_posts: `${req.protocol}://${req.get('host')}/posts`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

//Update a Post - Protcted
router.patch('/:id', checkAuth, (req, res) => {
    const updatePost = {}
    const id = req.params.id;
    for(const ops of req.body){
        updatePost[ops.key] = ops.value;
    }
    Post.update({_id: id}, {$set: updatePost})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Post Updated",
                url: `${req.protocol}://${req.get('host')}/posts/${id}`
            })
        })
        .catch(err => res.status(500).json({error: err}))
})

module.exports = router