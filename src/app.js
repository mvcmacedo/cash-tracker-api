import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';

import routes from './routes';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
    this.database();
  }

  middlewares() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(morgan('tiny'));
  }

  database() {
    if (process.env.NODE_ENV === 'test') return;

    mongoose
      .connect(process.env.DB_HOST, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => console.log('Database connected'));
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
