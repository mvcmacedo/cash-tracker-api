import { connect } from 'mongoose';

let db;

const up = async () => {
  db = await connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const down = () => db.disconnect();

export { up, down };
