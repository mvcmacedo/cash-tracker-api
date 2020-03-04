import { connect } from 'mongoose';

let database;

const up = async () => {
  database = await connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const down = () => database.disconnect();

export { up, down };
