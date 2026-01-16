import express from 'express';
import cors from 'cors';
import { setupAuth } from './auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

setupAuth(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
