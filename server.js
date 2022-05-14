const http = require('http');
const mongoose = require('mongoose');
const Post = require('./models/post');
const dotenv = require('dotenv');
const { errHandle, successHandle } = require('./models/responseHandle');

dotenv.config({ path: "./config.env" });
console.log(process.env)
const DB = process.env.DB.replace(
    '<password>',
    process.env.DB_PASSWORD
);
mongoose
    .connect(DB)
    .then(() => console.log('資料庫連接成功'))

const requestListener = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk
    });

    if (req.url == '/posts' && req.method == 'GET') {
        const posts = await Post.find();
        successHandle(res, posts);
    } else if (req.url == '/posts' && req.method == 'POST') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                if (!data.content == '' && !data.name == '') {
                    const newPost = await Post.create({
                        "content": data.content,
                        "image": data.image,
                        "name": data.name,
                        "like": 0
                    });
                    successHandle(res, newPost);
                } else {
                    errHandle(res, 400, 'content and name can not blank');
                }
            } catch (error) {
                errHandle(res, 400, 'input fleid error or ID not correct');
            }
        });
    } else if (req.url == '/posts' && req.method == 'DELETE') {
        await Post.deleteMany({});
        successHandle(res);
    } else if (req.url.startsWith('/posts/') && req.method == 'DELETE') {
        try {
            // 先取ID
            const id = req.url.split('/').pop();
            // 檢查id是否存在
            const user = await Post.findOne({ _id: id }).lean();
            if (user) {
                const posts = await Post.findByIdAndDelete(id);
                successHandle(res, posts);
            } else {
                errHandle(res, 400, 'ID不存在');
            }
        } catch (error) {
            errHandle(res, 400, error);
        }
    } else if (req.url.startsWith('/posts/') && req.method == 'PATCH') {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                // 先取ID
                const id = req.url.split('/').pop();
                // 檢查id是否存在
                const user = await Post.findOne({ _id: id }).lean();
                // if id 存在
                if (user) {
                    // 判斷兩者輸入不能是空值
                    if (!data.content == '' || !data.name == '') {
                        const updatePost = await Post.findByIdAndUpdate(id, {
                            $set: {
                                content: data.content,
                                name: data.name
                            }
                        }, { new: true, runValidators: true });
                        successHandle(res, updatePost);
                    } else {
                        errHandle(res, 400, 'content or name cannot input null ');
                    }
                } else {
                    errHandle(res, 400, 'ID不存在');
                }
            } catch (error) {
                errHandle(res, 400, error);
            }
        });
    } else if (req.url == '/' && req.method == 'OPTIONS') {
        res.writeHead(200, headers);
        res.end();
    } else {
        errHandle(res, 404, 'Route not exist')
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT);