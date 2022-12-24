import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!(process.env.PORT &&
    process.env.JSON_RPC_SERVER_IP &&
    process.env.JSON_RPC_SERVER_PORT &&
    process.env.MONGO_SERVER &&
    process.env.MONGO_USER &&
    process.env.MONGO_PASSWORD
)) {
    throw new Error('Missing required environment variables');
}

mongoose.set('strictQuery', true);

import express from 'express';
import bodyParser from 'body-parser';
import * as core from 'express-serve-static-core';

import ErrorMiddleware from './middlewares/error.middleware';
import NotFoundMiddleware from './middlewares/not-found.middleware';

import GetDeadlinesController from './controllers/get.deadlines.controller';
import PostDeadlinesController from './controllers/post.deadlines.controller';
import PutDeadlinesCompleteController from './controllers/put.deadlines.complete.controller';
import DeleteDeadlinesCompleteController from './controllers/delete.deadlines.complete.controller';

const app: core.Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/deadlines', GetDeadlinesController);
app.post('/deadlines', PostDeadlinesController);
app.put('/deadlines/:id/complete', PutDeadlinesCompleteController);
app.delete('/deadlines/:id/complete', DeleteDeadlinesCompleteController);
app.use(ErrorMiddleware);
app.use(NotFoundMiddleware);

(() => {
   const urlMongo: string = `mongodb+srv://${ process.env.MONGO_USER }:${ process.env.MONGO_PASSWORD }@${ process.env.MONGO_SERVER }/?retryWrites=true&w=majority`;

   return mongoose.connect(urlMongo)
       .then(() => console.log('Success connect Mongo'))
       .catch((err: any) => {
          console.error('Failed to connect to the Mongo database');
          process.exit(1);
       })
       .then(() => {
           app.listen(process.env.PORT, () => console.log(`Server start at port ${ process.env.PORT }`));
       });
})();

