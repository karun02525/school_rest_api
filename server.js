import express from "express";
import { APP_PORT } from "./config";
import routers from './routes';
import adminRouters from './routes/admin.js';
import './config/databaseConfig.js';
import errorHandler from "./middlewares/errorHandler";
import path from 'path';




const app=express();

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use('/api',routers);
app.use('/api/admin',adminRouters);

app.use('/uploads',express.static('uploads'));



app.use(errorHandler)
app.listen(APP_PORT,()=>console.log(`'server runing..on port ${APP_PORT}`));