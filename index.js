const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require('path');
const logger = require('morgan');
const fileUpload = require('express-fileupload');

const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()

app.use(fileUpload({}));
app.use('/uploads', express.static('uploads'));
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rjopapp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });







 

// this for image upload in tinymce
app.post('/postImage', (req, res) => {
    const sampleFile = req.files.file;
    const filename = `uploads/contentImage/` + Date.now() + `-` + sampleFile.name;
    sampleFile.mv(path.join(__dirname, filename));
    // console.log(filename);
    res.status(200).json({
        location: `http://localhost:5000/` + filename
    })
})

// this is for thumbnail image upload

app.post('/thumbnailImage', (req, res) => {
    // console.log(req.files.thumbnailImage);
    const thumbnailImage = req.files.thumbnailImage;
    const fileName = `uploads/thumbnailImage/` + Date.now() + `-` + thumbnailImage.name;
    thumbnailImage.mv(path.join(__dirname, fileName));
    res.status(200).send(`http://localhost:5000/`+fileName);
})






// app.post('/uploadImage', upload.single('image'), (req, res) => {
//     console.log(req.file);
//     res.status(200).send(req.file);
//     // res.status(200).send(req.file);
// })



async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const postCollection = client.db('pronob_the_explorer').collection('posts');
        const userCollection = client.db('pronob_the_explorer').collection('users');

        //add user

        app.post('/user/signup/:email', async (req, res) => {
            // console.log(req.body);
            const newUser = await req.body;
            const {email} = req.params;
            // console.log(email);
            const isUser =await userCollection.findOne({email: email}); 
            if (isUser) {
                res.send({success : false});
            }
            else {
                const result = await userCollection.insertOne(newUser);
                res.status(200).send(result);
            }
        })
        
        //log in user

        app.post('/user/login/:email', async(req, res) => {
            // console.log(req.body);
            const { email, password } = req.body;
            const isUser = await userCollection.findOne({ email: email });
            if (isUser) {
                // console.log(isUser);
                if (isUser.password === password) {
                    res.send({ success: true , name : isUser.name });
                }
                else {
                    res.send({ success: false });
                }
            }
        })


        // this is for adding post

        app.post('/addPost', async (req, res) => {
            // console.log(req.body);
            const newPost = await req.body;
            // console.log(newPost);
            const result = await postCollection.insertOne(newPost);
            res.status(200).send(result);
        })


        //this is for getting post

        app.get('/posts', async (req, res) => {
            const posts = await postCollection.find().toArray();
            res.send(posts);
        })

        //this is for getting single post
        app.get('/posts/:postId', async (req, res) => {
            const postId = req.params.postId;
            // console.log(postId);
            const objectId = ObjectId(postId);
            // console.log(objectId);
            const isPost = await postCollection.findOne({ _id: objectId });
            res.send(isPost);
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello From Explorer!')
})

app.listen(port, () => {
    console.log(`Explorer app listening on port ${port}`)
}) 


