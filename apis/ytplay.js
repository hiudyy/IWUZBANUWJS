const express = require('express');
const router = express.Router();
const yts = require('yt-search');
const ytdl = require('ytdl-core');

const ytplay = async (input) => {
  try {
    if (!input) {
      throw new Error('Input não especificado');
    }
    let info;
    let isSearch = false;
    if (input.startsWith('https://www.youtube.com/') || input.startsWith('https://youtu.be/')) {
      info = await ytdl.getInfo(input, { lang: 'en' });
    } else {
      const searchResults = await yts(input);
      if (!searchResults.videos.length) {
        throw new Error('Nenhum video encontrado para essa pesquisa');
      }
      info = await ytdl.getInfo(searchResults.videos[0].url, { lang: 'en' });
      isSearch = true;
    }

    const { videoDetails } = info;
    const audioURL = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }).url;
    const videoURL = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' }).url;
    const shortAudioURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${audioURL}`)).text();
    const shortVideoURL = await (await fetch(`https://tinyurl.com/api-create.php?url=${videoURL}`)).text();

    const data = {
      status: true,
      criador: "hiudy",
      data: {
        canalurl: videoDetails.author.channel_url,
        views: videoDetails.viewCount,
        categoria: videoDetails.category,
        id: videoDetails.videoId,
        link: videoDetails.video_url,
        dataPublicacao: videoDetails.publishDate,
        dataUpload: videoDetails.uploadDate,
        titulo: videoDetails.title,
        canal: videoDetails.author.name,
        segundos: videoDetails.lengthSeconds,
        thumb: videoDetails.thumbnails.slice(-1)[0].url,
        download: {
          audio: audioURL,
          video: videoURL,
        },
      },
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const formattedJsonString = jsonString.replace(/,\s*(?=\w+:)/g, ",\n");
    return formattedJsonString
  } catch (error) {
    throw error;
  }
};

router.get('/', async (req, res) => {
  const textoplay = req.query.text;
  const linkvideo = req.query.url;
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
    if (!textoplay && !linkvideo) {
    	const Mensagemdeerro = {
        status: false,
        criador: "hiudy",
        data: "Deve especificar um texto ou um link"
      };
      const formattedResults_e = JSON.stringify(Mensagemdeerro, null, 2);
      res.setHeader('Content-Type', 'application/json');
      res.send(formattedResults_e);
      return;
    }
    let resultado
    if(textoplay) {
    	resultado = await ytplay(textoplay)
    } else {
    	resultado = await ytplay(linkvideo)
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(resultado);
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
