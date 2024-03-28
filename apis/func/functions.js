const axios = require('axios');
const { isAxiosError } = require("axios");
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { fromBuffer  } = require('file-type');
const request = require('request')
const { TiktokStalk } = require("@tobyg74/tiktok-api-dl")
const FormData = require('form-data');
const getTwitterMedia = require('get-twitter-media');

async function downloadTwitterMedia(url) {
    try {
        let media = await getTwitterMedia(url, { text: true });
        let response = {
            status: true,
	    resultado: {	
            caption: media.text || '',
            media: []
	  }
        };
        for (let item of media.media) {
            let mediaItem = {};
            if (item.url) {
                let fileType = getFileTypeFromUrl(item.url);

                if (fileType === 'video') {
                    mediaItem = {
                        type: 'video',
                        url: item.url
                    };
                } else if (fileType === 'image') {
                    mediaItem = {
                        type: 'image',
                        url: item.url
                    };
                }
            }
            mediaItem.type && response.resultado.media.push(mediaItem);
        }
        return response;
    } catch (error) {
        return { status: false, error: error.message };
    }
}

function getFileTypeFromUrl(url) {
    let videoRegex = /\/ext_tw_video\//;
    let imageRegex = /\/media\//;
    if (videoRegex.test(url)) {
        return 'video';
    } else if (imageRegex.test(url)) {
        return 'image';
    }
    return 'unknown';
}

async function maker(url, text) {
   if (/https?:\/\/(ephoto360|photooxy|textpro)\/\.(com|me)/i.test(url)) throw new Error("URL Invalid")
   try {
      let a = await axios.get(url, {
         headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Origin": (new URL(url)).origin,
            "Referer": url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188"
         }
      })
      let $ = cheerio.load(a.data)
      let server = $('#build_server').val()
      let serverId = $('#build_server_id').val()
      let token = $('#token').val()
      let submit = $('#submit').val()
      let types = [];
      $('input[name="radio0[radio]"]').each((i, elem) => {
         types.push($(elem).attr("value"));
      })
      let post;
      if (types.length != 0) {
         post = {
            'radio0[radio]': types[Math.floor(Math.random() * types.length)],
            'submit': submit,
            'token': token,
            'build_server': server,
            'build_server_id': Number(serverId)
         };
      }
      else {
         post = {
            'submit': submit,
            'token': token,
            'build_server': server,
            'build_server_id': Number(serverId)
         }
      }
      let form = new FormData()
      for (let i in post) {
         form.append(i, post[i])
      }
      if (typeof text == "string") text = [text]
      for (let i of text) form.append("text[]", i)
      let b = await axios.post(url, form, {
         headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Origin": (new URL(url)).origin,
            "Referer": url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188", 
            "Cookie": a.headers.get("set-cookie").join("; "),
            ...form.getHeaders()
         }
      })
      $ = cheerio.load(b.data)
      let out = ($('#form_value').first().text() || $('#form_value_input').first().text() || $('#form_value').first().val() || $('#form_value_input').first().val())
      let c = await axios.post((new URL(url)).origin + "/effect/create-image", JSON.parse(out), {
         headers: {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": (new URL(url)).origin,
            "Referer": url,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
            "Cookie": a.headers.get("set-cookie").join("; ")
         }
      })
      return {status: c.data?.success, image: server + (c.data?.fullsize_image || c.data?.image || ""), session: c.data?.session_id}
   } catch (e) {
      throw e
   }
}

async function ttp(text) {
	return new Promise(async (resolve, reject) => {
		const getid = await axios.get('https://id.bloggif.com/text')
		const id = cheerio.load(getid.data)('form').attr('action')
		const options = {
			method: "POST",
			url: `https://id.bloggif.com${id}`,
			headers: {
				"content-type": 'application/x-www-form-urlencoded',
				"user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
			},
			formData: {
				target: 1,
				text: text,
				glitter_id: Math.floor(Math.random() * 2821),
				font_id: 'lucida_sans_demibold_roman',
				size: 50,
				bg_color: 'FFFFFF',
				transparent: 1,
				border_color: '000000',
				border_width: 2,
				shade_color: '000000',
				shade_width: 1,
				angle: 0,
				text_align: 'center'
			},
		};
		request(options, async function(error, response, body) {
			if (error) return new Error(error)
			const $ = cheerio.load(body)
			const url = $('.box.center > a').attr('href')
			resolve({
				status: true,
				resultado: 'https://id.bloggif.com' + url
			})
		})
	})
}

async function pinterest(query) {
    const url = `https://ar.pinterest.com/search/pins/?autologin=true&q=${query}`;
    const response = await axios.get(url);
    const resultado = [];
    const $ = cheerio.load(response.data);
    $('img').each(function () {
      resultado.push($(this).attr('src'));
    });
    return { status: true, criador: "hiudy", data: resultado };
  }

async function stickersearch(query) {
    return new Promise((resolve, reject) => {
        axios.get(`https://getstickerpack.com/stickers?query=${query}`).then(({ data }) => {
                const $ = cheerio.load(data)
                const source = [];
                const link = [];
                $('#stickerPacks > div > div:nth-child(3) > div > a').each(function(a, b) {
                    source.push($(b).attr('href'))
                })
                axios.get(source[Math.floor(Math.random() * source.length)]).then(({ data }) => {
                        const $$ = cheerio.load(data)
                        $$('#stickerPack > div > div.row > div > img').each(function(c, d) {
                            link.push($$(d).attr('src').replace(/&d=200x200/g,''))
                        })
                        result = {
                            status: true,
                            resultado: {
                            title: $$('#intro > div > div > h1').text(),
                            sticker_url: link
                          }
                        }
                        resolve(result)
                    })
            }).catch(reject)
    })
}

async function igStalk(username) {
    try {
        username = username.replace(/^@/, '');
        const html = await (await fetch(`https://dumpor.com/v/${username}`)).text();
        const $$ = cheerio.load(html);
        const errorTitle = $$('h1.error__title').text().trim();
        if (errorTitle === 'Page not found') {
          return { status: false, message: `El usuario "${username}" no existe.` };
        }
        const name = $$('div.user__title > a > h1').text().trim();
        const Uname = $$('div.user__title > h4').text().trim();
        const description = $$('div.user__info-desc').text().trim();
        const profilePic = $$('div.user__img').attr('style').match(/url\('(.+)'\)/)[1];
        const row = $$('#user-page > div.container > div > div > div:nth-child(1) > div > a');
        const postsH = row.eq(0).text().replace(/Posts/i, '').trim();
        const followersH = row.eq(2).text().replace(/Followers/i, '').trim();
        const followingH = row.eq(3).text().replace(/Following/i, '').trim();
        const list = $$('ul.list > li.list__item');
        const posts = parseInt(list.eq(0).text().replace(/Posts/i, '').replace(/\s+/g, ''));
        const followers = parseInt(list.eq(1).text().replace(/Followers/i, '').replace(/\s+/g, ''));
        const following = parseInt(list.eq(2).text().replace(/Following/i, '').replace(/\s+/g, ''));
        return { status: true, resultado: {name, username: Uname, description, postsH, posts, followersH, followers, followingH, following, profilePic }};
    } catch (error) {
        return { status: false, error: error.message };
    }
}

async function getCookie() {
  try {
    const { data: cookie } = await axios.get("https://pastebin.com/raw/ELJjcbZT");
    return cookie;
  } catch (e) {
    return { status: "error", message: "Failed to fetch cookie." };
  }
}

async function tiktokStalk(username, options) {
  try {
    username = username.replace("@", "");
    const data = await TiktokStalk(username, { cookie: await getCookie() });
    if (!data || !data?.result || !data?.result?.users || !data?.result?.stats) return { status: false, message: 'Username no encontrado, verifique nuevamente.' };
    const userData = data.result.users;
    const statsData = data.result.stats;
    return {
      status: true,
      resultado: {
          username: userData.username,
          nickname: userData.nickname,
          pp_thumbnail: userData.avatarLarger,
          description: userData.signature,
          isVerify: userData.verified,
          isPrivate: userData.privateAccount,
          isUserCommerce: userData.commerceUser,
          region: userData.region,
          followers: statsData.followerCount,
          following: statsData.followingCount,
          friends: statsData.friendCount,
          totalLikes: statsData.heartCount,
          totalVideos: statsData.videoCount,
          totalPosts: statsData.postCount,
          LastUsernameModification: userData.usernameModifyTime,
          LastNicknameModification: userData.nicknameModifyTime          
      },
    };
  } catch (e) {
    return { status: false, message: e.message };
  }
}

async function googleImage(query) {
  const data = await fetch(`https://www.google.com/search?q=${query}&tbm=isch`, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,id;q=0.8',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36',
    },
  }).then((response) => response.text());
  const $ = cheerio.load(data);
  const pattern =
    /\[1,\[0,"(?<id>[\d\w\-_]+)",\["https?:\/\/(?:[^"]+)",\d+,\d+\]\s?,\["(?<url>https?:\/\/(?:[^"]+))",\d+,\d+\]/gm;
  const matches = [...$.html().matchAll(pattern)];
  const decodeUrl = (url) => decodeURIComponent(JSON.parse(`"${url}"`));
  return matches
    .map(({ groups }) => decodeUrl(groups?.url))
    .filter((v) => /.*\.jpe?g|png$/gi.test(v));
}

async function ssweb(url = '', full = false, type = 'desktop') {
    type = type.toLowerCase();
    if (!['desktop', 'tablet', 'phone'].includes(type)) type = 'desktop';
    try {
        const thumioUrl = `https://image.thum.io/get/fullpage/${url}`;
        const thumioResponse = await axios.get(thumioUrl, { responseType: 'arraybuffer' });
        if (thumioResponse.data) {
            return Buffer.from(thumioResponse.data, 'base64');
        }
    } catch (error) {}
    let form = new URLSearchParams();
    form.append('url', url);
    form.append('device', type);
    if (!!full) form.append('full', 'on');
    form.append('cacheLimit', 0);
    let res = await axios({
        url: 'https://www.screenshotmachine.com/capture.php',
        method: 'post',
        data: form,
    });
    let cookies = res.headers['set-cookie'];
    let buffer = await axios({
        url: 'https://www.screenshotmachine.com/' + res.data.link,
        headers: {
            'cookie': cookies.join(''),
        },
        responseType: 'arraybuffer',
    });
    return Buffer.from(buffer.data, 'base64');
}

async function wallpaper(title, page = '1') {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`).then(({data}) => {
      const $ = cheerio.load(data);
      const hasil = [];
      $('div.grid-item').each(function(a, b) {
        hasil.push({
          title: $(b).find('div.info > a > h3').text(),
          type: $(b).find('div.info > a:nth-child(2)').text(),
          source: 'https://www.besthdwallpaper.com/'+$(b).find('div > a:nth-child(3)').attr('href'),
          image: [$(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'), $(b).find('picture > source:nth-child(1)').attr('srcset'), $(b).find('picture > source:nth-child(2)').attr('srcset')],
        });
      });
      resolve(hasil);
    });
  });
}

async function lyrics(search) {
  const searchUrl = `https://www.musixmatch.com/search/${search}`;
  const searchResponse = await axios.get(searchUrl);
  const searchHtml = searchResponse.data;
  const $ = cheerio.load(searchHtml);
  const link = $('div.media-card-body > div > h2').find('a').attr('href');
  const lyricsUrl = `https://www.musixmatch.com${link}`;
  const lyricsResponse = await axios.get(lyricsUrl);
  const lyricsHtml = lyricsResponse.data;
  const $$ = cheerio.load(lyricsHtml);
  const thumb = $$('div.col-sm-1.col-md-2.col-ml-3.col-lg-3.static-position > div > div > div').find('img').attr('src');
  const lyrics1 = $$('div.col-sm-10.col-md-8.col-ml-6.col-lg-6 > div.mxm-lyrics > span > p > span').text().trim();
  const lyrics2 = $$('div.col-sm-10.col-md-8.col-ml-6.col-lg-6 > div.mxm-lyrics > span > div > p > span').text().trim();
  const title = $$('#site > div > div > div > main > div > div > div.mxm-track-banner.top > div > div > div').find('div.col-sm-10.col-md-8.col-ml-9.col-lg-9.static-position > div.track-title-header > div.mxm-track-title > h1').text().trim().replace('Lyrics','')
  const artist = $$('#site > div > div > div > main > div > div > div > div > div > div > div> div > div > h2 > span').text().trim();
  const img = `https:${thumb || ''}`
  let lyrics;
  if (lyrics1 && lyrics2) {
  lyrics = `${lyrics1}\n${lyrics2}`;
  } else if (lyrics1) {
  lyrics = lyrics1;
  } else if (lyrics2) {
  lyrics = lyrics2;
  } else {
  lyrics = false;
  }
  if (!thumb || (!lyrics1 || !lyrics2 || !lyrics)) {
    return { status: false, message: 'Algunos de los datos no fueron obtenidos correctamente.', resultado: { titulo: title ? title : 'Titulo no encontrado', artista: artist ? artist : 'Artista no encontrado', imagen: img ? img : 'Imagen no encontrada', letra: lyrics ? lyrics : 'Letra no encontrada'}};
  }
  return { status: true, resultado: { titulo: title, artista: artist, imagen: `https:${thumb}`, letra: lyrics}};
}

function RandomAgresivo(min, max) {
  if (typeof RandomAgresivo.seen === 'undefined') {
    RandomAgresivo.seen = [];
  }
  if (RandomAgresivo.seen.length === 0) {
    RandomAgresivo.seen = Array.from({ length: max - min + 1 }, (_, index) => index + min);
  }
  const randomIndex = Math.floor(Math.random() * RandomAgresivo.seen.length);
  const randomNumber = RandomAgresivo.seen[randomIndex];
  RandomAgresivo.seen.splice(randomIndex, 1);
  return randomNumber;
}

function getFileName(prefix, directory) {
  let index = 1;
  let fileName = `${prefix}`;
  const ext = path.extname(prefix);
  const name = path.basename(prefix, ext);
  while (fs.existsSync(path.join(directory, fileName))) {
    fileName = `${name}+${index}${ext}`;
    index++;
  }
  return fileName;
}

const getBuffer = async (url, options) => {
    options = options || {};
    const res = await axios({
        method: 'get',
        url,
        headers: {
            'DNT': 1,
            'Upgrade-Insecure-Request': 1,
        },
        ...options,
        responseType: 'arraybuffer'
    });
    return res.data;
};

const getBuffer2 = async (url, options) => {
  options = options || {};
  const res = await axios({
    method: 'get',
    url,
    headers: {
      'DNT': 1,
      'Upgrade-Insecure-Request': 1,
    },
    ...options,
    responseType: 'arraybuffer'
  });
  const buffer = Buffer.from(res.data, 'base64');
  const typeInfo = await fromBuffer(buffer);
  let bufferResult = '';
  let fileTypeResult = '';
  let fileSize = '';
  if (typeInfo) {
    fileTypeResult = typeInfo.mime;
  }
  if (buffer) {
    bufferResult = buffer;
    const fileSizeBytes = buffer.length;
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    if (fileSizeMB % 1 === 0) {
      fileSize = fileSizeMB.toFixed(0); 
    } else {
      fileSize = fileSizeMB.toFixed(2); 
    }
  }
  return {
    buffer: bufferResult,
    fileType: fileTypeResult,
    fileSize: fileSize
  };
};

function xnxxdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}`, {method: 'get'}).then((res) => res.text()).then((res) => {
      const $ = cheerio.load(res, {xmlMode: false});
      const title = $('meta[property="og:title"]').attr('content');
      const duration = $('meta[property="og:duration"]').attr('content');
      const image = $('meta[property="og:image"]').attr('content');
      const videoType = $('meta[property="og:video:type"]').attr('content');
      const videoWidth = $('meta[property="og:video:width"]').attr('content');
      const videoHeight = $('meta[property="og:video:height"]').attr('content');
      const info = $('span.metadata').text();
      const videoScript = $('#video-player-bg > script:nth-child(6)').html();
      const files = {
        low: (videoScript.match('html5player.setVideoUrlLow\\(\'(.*?)\'\\);') || [])[1],
        high: videoScript.match('html5player.setVideoUrlHigh\\(\'(.*?)\'\\);' || [])[1],
        HLS: videoScript.match('html5player.setVideoHLS\\(\'(.*?)\'\\);' || [])[1],
        thumb: videoScript.match('html5player.setThumbUrl\\(\'(.*?)\'\\);' || [])[1],
        thumb69: videoScript.match('html5player.setThumbUrl169\\(\'(.*?)\'\\);' || [])[1],
        thumbSlide: videoScript.match('html5player.setThumbSlide\\(\'(.*?)\'\\);' || [])[1],
        thumbSlideBig: videoScript.match('html5player.setThumbSlideBig\\(\'(.*?)\'\\);' || [])[1]};
      resolve({status: true, result: {title, URL, duration, image, videoType, videoWidth, videoHeight, info, files}});
    }).catch((err) => reject({status: false, result: err}));
  });
}

function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com';
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {method: 'get'}).then((res) => res.text()).then((res) => {
      const $ = cheerio.load(res, {xmlMode: false});
      const title = [];
      const url = [];
      const desc = [];
      const results = [];
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb').each(function(c, d) {
          url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
        });
      });
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb-under').each(function(c, d) {
          desc.push($(d).find('p.metadata').text());
          $(d).find('a').each(function(e, f) {
            title.push($(f).attr('title'));
          });
        });
      });
      for (let i = 0; i < title.length; i++) {
        results.push({title: title[i], info: desc[i], link: url[i]});
      }
      resolve({status: true, result: results});
    }).catch((err) => reject({status: false, result: err}));
  });
}


module.exports = {
  getBuffer,
  getBuffer2,
  RandomAgresivo,
  getFileName,
  xnxxsearch,
  xnxxdl,
  lyrics,
  wallpaper,
  ssweb,
  googleImage,
  igStalk,
  tiktokStalk,
  ttp,
  stickersearch,
  pinterest,
  maker,
  downloadTwitterMedia
};
