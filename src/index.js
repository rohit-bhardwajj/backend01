import 'dotenv/config'
import connectdb from './db/index.js'
import {app} from './app.js'

connectdb()
.then(()=>{  
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running on Port:${process.env.PORT}`);   
    })
})
.catch((err)=>{
    console.log("Mongodb connection error !!",err);
})





/*  import mongoose from 'mongoose';
import express from 'express'
const app = express()
import { DB_NAME } from './constants';
( async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       
    }
    catch(error){
        console.error("Error:",error);
    }
})()
//database connection using await and IIFE     
*/
