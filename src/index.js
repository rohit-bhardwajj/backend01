// import 'dotenv/config'
import dotenv from 'dotenv'

import connectdb from './db/index.js'

dotenv.config({
    path:'./.env'
})
connectdb()





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
