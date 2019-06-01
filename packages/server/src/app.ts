// @ts-check
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { port as serverPort } from './env';
import { ParticipantExpressController, PersonExpressController } from './controllers';
import * as cors from 'cors';

const app: express.Application = express();
const port = serverPort;

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '40mb'
}));
app.use(bodyParser.json({ limit: '40mb' }));

app.use(cors());
app.use('/participant', ParticipantExpressController);
app.use('/person', PersonExpressController);



app.listen(port, () =>
  console.log(`Server started in port ${port}`));

module.exports = app;
