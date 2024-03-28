const express = require('express');
const router = express.Router();
const { Hercai } = require('hercai');
const herc = new Hercai(); 

async function gerarImg(query) {
	const data = await herc.question({model:"gemini",content:`${query}`})
	const result = {	
      status: true,
      criador: "hiudy",
      data: {
      	result: data.reply,
          },
		}
    const jsonString = JSON.stringify(result, null, 2);
    const formattedJsonString = jsonString.replace(/,\s*(?=\w+:)/g, ",\n");
    return formattedJsonString
	}
	
router.get('/', async (req, res) => {
  const query = req.query.text;
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
    if (!query) {
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
    resultado = await gerarImg(query)
    res.setHeader('Content-Type', 'application/json');
    res.send(resultado);
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