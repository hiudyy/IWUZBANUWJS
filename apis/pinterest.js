const express = require('express');
const router = express.Router();
const { pinterest } = require('./func/functions.js');

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
    const pint = await pinterest(texto);
    const formattedResults = JSON.stringify(pint, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.send(formattedResults);
   } catch (error) {
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