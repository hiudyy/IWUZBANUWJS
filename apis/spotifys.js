const express = require('express');
const router = express.Router();
const { spotifySearch2 } = require('./func/spotify.js');

router.get('/', async (req, res) => {
  const texto = req.query.text;
  const apikey = req.query.key;
  try {
  	if (!apikey) {
    	const Mensagemdeerro = {
        status: false,
        criador: "hiudy",
        data: "Deve especificar uma apikey"
      };
      const formattedResults_e = JSON.stringify(Mensagemdeerro, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }
    if (!texto) {
    	const Mensagemdeerro = {
        status: false,
        criador: "hiudy",
        data: "Deve especificar um texto"
      };
      const formattedResults_e = JSON.stringify(Mensagemdeerro, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }
    let resultado
    const spty = await spotifySearch2(texto);
    const formattedResponse = {status: true, criador: "hiudy", data: spty};
    const formattedResults2 = JSON.stringify(formattedResponse, null, 2);
    res.setHeader('Content-Type', 'application/json');  
    res.send(formattedResults2);
   } catch (error) {
   	console.log(error)
    const Mensagemdeerro = {
        status: false,
        criador: "hiudy",
        data: "Ocorreu um erro interno no servidor"
      };
      const formattedResults_e = JSON.stringify(Mensagemdeerro, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
  }
});
module.exports = router;