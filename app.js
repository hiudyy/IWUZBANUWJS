const express = require('express');
const app = express();
const port = 25573;
let totalRequests = 0;
let totalVisitors = 0;

const getUptime = () => {
  const uptimeInSeconds = Math.floor(process.uptime());
  const hours = Math.floor(uptimeInSeconds / 3600);
  const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
  const seconds = uptimeInSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

app.set('trust proxy', 1)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/docs', (req, res) => {
  totalVisitors++
  res.sendFile(__dirname + '/public/docs.html');
});

app.get('/file1c', (req, res) => {res.sendFile(__dirname + '/public/docs/file1.css');});app.get('/file2c', (req, res) => {res.sendFile(__dirname + '/public/docs/file2.css');});app.get('/file3c', (req, res) => {res.sendFile(__dirname + '/public/docs/file3.css');});app.get('/file4c', (req, res) => {res.sendFile(__dirname + '/public/docs/file4.css');});app.get('/file1j', (req, res) => {res.sendFile(__dirname + '/public/docs/file1.js');});app.get('/file2j', (req, res) => {res.sendFile(__dirname + '/public/docs/file2.js');});app.get('/file3j', (req, res) => {res.sendFile(__dirname + '/public/docs/file3.js');});app.get('/file4j', (req, res) => {res.sendFile(__dirname + '/public/docs/file4.js');});app.get('/file5j', (req, res) => {res.sendFile(__dirname + '/public/docs/file5.js');});


const ytplay = require('./apis/ytplay.js');
app.use('/api/ytplay', ytplay)
const lexica = require('./apis/lexica.js');
app.use('/ia/lexica', lexica)
const prodia = require('./apis/prodia.js');
app.use('/ia/prodia', prodia)
const simurg = require('./apis/simurg.js');
app.use('/ia/simurg', simurg)
const animefy = require('./apis/animefy.js');
app.use('/ia/animefy', animefy)
const raava = require('./apis/raava.js');
app.use('/ia/raava', raava)
const shonin = require('./apis/shonin.js');
app.use('/ia/shonin', shonin)
const dalle = require('./apis/dalle.js');
app.use('/ia/dalle', dalle)
const texttoimgv1 = require('./apis/texttoimg-v1.js');
app.use('/ia/texttoimg-v1', texttoimgv1)
const texttoimgv2 = require('./apis/texttoimg-v2.js');
app.use('/ia/texttoimg-v2', texttoimgv2)
const gemini = require('./apis/gemini.js');
app.use('/ia/gemini', gemini)
const hgaiv1 = require('./apis/hgai-v1.js');
app.use('/ia/hgai-v1', hgaiv1)
const hgaiv2 = require('./apis/hgai-v2.js');
app.use('/ia/hgai-v2', hgaiv2)
const hgaiv3 = require('./apis/hgai-v3.js');
app.use('/ia/hgai-v3', hgaiv3)
const hgaiv4 = require('./apis/hgai-v4.js');
app.use('/ia/hgai-v4', hgaiv4)
const tiktokv1 = require('./apis/tiktok.js');
app.use('/api/tiktokv1', tiktokv1)
const pinterest = require('./apis/pinterest.js');
app.use('/api/pinterest', pinterest)
const spotifys = require('./apis/spotifys.js');
app.use('/api/spotifys', spotifys)

app.get('/status', (req, res) => {
  const uptime = getUptime();
  const end = Date.now(); //
  //console.log(req.startTime)
  const averageResponseTime = end - req.startTime;
  //totalRequests--; 
  const response = {
    uptime: uptime,
    latencia: `${averageResponseTime} ms`,
    totalRequests: totalRequests,
    totalVisitors: totalVisitors,
    creator: 'Hiudy',
    phoneNumber: '+55 33 98230030'
  };
  const formattedResponse = JSON.stringify(response, null, 2);
  res.setHeader('Content-Type', 'application/json');
  res.end(formattedResponse);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});