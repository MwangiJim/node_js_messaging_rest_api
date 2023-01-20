import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose';
import MessageModel from './models/MessageModel.js';
import jwt from 'jsonwebtoken';
import UsersDb from './models/UsersDb.js';


const app = express();
app.use(express.json())
app.use(cors())
let ACCESS_TOKEN = '0e5effdd1e09fa4c9c2536bad0f7916f5eef1e7b5e4b96f0bfa6943fa5227c9d2d748d6fd91c876f73fc780445a33dc53b9494f6cb9351ed9b29d70d9ba2a70f';
let REFRESH_TOKEN = 'd3cc612dbf6ad228a8b2662490b91574b9a818de235adeb0ecdc4073ea49526743a643b17a5b373ea4496d898763ff8ae780f866763097b3d6179c1df8808905';


function AuthenticateToken(req,res,next){
    const auth_header = req.headers['authorization'];
    const token = auth_header && auth_header.split(' ')[1];

    if(token === null){
        res.status(400).json({'msg':'invalid token'})
    }
    else{
        jwt.verify(token,ACCESS_TOKEN,(err,user)=>{
            if(err){
               res.status(400).json({'msg':'Invalid Token'})
            }
            else{
                res.user = user;
                next();
            }
        })
    }
}
//route to create messages
app.post('/createMessage',async(req,res)=>{
    const message = req.body.message;
    const datestamp = req.body.date;
    const receipient = req.body.receipient;
    const timestamp = req.body.time;

    if(!message && !datestamp){
       res.status(500).json({'message':'Invalid Request'})
    }
    else{
        const newMessagePost = await MessageModel.create({
            Message:message,
            DateCreated:datestamp,
            TimeCreated:timestamp,
            Receipient:receipient
        })
        res.status(201).json({'message':newMessagePost})
        console.log(newMessagePost)
    }
})
//route to fetch messages from mongodb
app.get('/getMessages',async(req,res)=>{
    const foundMessages = await MessageModel.find();
    if(!foundMessages){
        res.status(403).json({'message':'No messages were found'})
    }
    else{
        res.status(200).json({'message':foundMessages})
    }
})

//route to create users
app.post('/createUsers',async(req,res)=>{
    const name = req.body.username;
    const phonenumber = req.body.phonenumber;
    const password = req.body.password
 
    if(!name && !phonenumber){
     res.status(500).json({'message':'No Inputs Found'})
    }
    else{
            const newUser = await UsersDb.create({
                 Name:name,
                 PhoneNumber:phonenumber,
                 Password:password
             })
             const User = {name:name};
             const token = jwt.sign(User,ACCESS_TOKEN,{expiresIn:'30m'})
             res.status(201).json({'message':newUser,'token':token})
             console.log(newUser)
    }
})
//route to fetch users in the db
app.get('/getUsers',AuthenticateToken,async(req,res)=>{
        const FoundUsers = await UsersDb.find();
        if(!FoundUsers){
            res.status(400).json({'message':'User not Found'})
        }
        else{
            res.status(200).json({'message':FoundUsers})
        }
})
//route to login
app.post('/login',async(req,res)=>{
    let pwd = req.body.password;
    let username = req.body.username;

    const User = {name:username};
    const token = jwt.sign(User,ACCESS_TOKEN,{expiresIn:'30m'})
    const refreshToken = jwt.sign(User,REFRESH_TOKEN);
    res.send({'message':'Login Successful','access_token':token,'refresh_token':refreshToken})
})

app.all('*',(req,res)=>{
    res.status(500).json({'msg':'Page not Found'})
})

mongoose.connect('mongodb://127.0.0.1:27017/telegram_Store')
.then(()=>{
    console.log('Db connected Successfully')
    app.listen(8080,()=>console.log('App is running'))
})
.catch((err)=>{
    console.log(err.message)
})
