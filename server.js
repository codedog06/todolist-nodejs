const http = require('http');
const mongoose = require('mongoose');
const Post = require('./models/post');
const dotenv = require('dotenv');

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DB_PASSWORD
);
mongoose
    .connect(DB)
    .then(() => console.log('資料庫連接成功'))
    .catch((err) => console.log(err));

const requestListener = async(req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk
    });

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    if (req.url == '/posts' && req.method == 'GET') {
        const posts = await Post.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            'status': 'success',
            posts
        }));
        res.end();
    } else if (req.url == '/posts' && req.method == 'POST') {
        req.on('end', async() => {
            try {
                const data = JSON.parse(body);
                const newPost = await Post.create({
                    "content": data.content,
                    "image": data.image,
                    "name": data.name,
                    "like": 0
                });
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    'status': 'success',
                    posts: newPost
                }));
                res.end();
            } catch (error) {
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    'status': 'false',
                    'message': 'input fleid error or ID not correct',
                    'error': error
                }))
                res.end();
            }
        });
    } else if (req.url == '/posts' && req.method == 'DELETE') {
        await Post.deleteMany({});
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            'status': 'success',
        }));
        res.end();
    } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
        const id = req.url.split('/').pop();
        const posts = await Post.findByIdAndDelete(id);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            'status': 'success',
            'message': id + 'deleted' + posts
        }));
        res.end();
    } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
        req.on('end', async() => {
            try {
                const data = JSON.parse(body);
                const id = req.url.split('/').pop();
                const updatePost = await Post.findByIdAndUpdate(id, {
                        $set: {
                            name: data.name,
                            content: data.content
                        }
                    }, { new: true })
                    .then(() => { console.log('update success') })
                    .catch((err) => { console.log(err) });
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    'status': 'success',
                    updatePost
                }));
                res.end();
            } catch (error) {
                console.log(error);
                res.end();
            }
        });
    } else if (req.url == '/' && req.method == 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            'status': 'false',
            'message': 'Route not exist'
        }));
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);