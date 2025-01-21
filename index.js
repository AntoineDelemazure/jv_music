const request = require('request');
const cheerio = require('cheerio');

const https = require('https');
const fs = require('fs');



function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const radical = 'https://downloads.khinsider.com'
const treasureRegex = /^https:\/\/.*\.mp3$/

request('https://downloads.khinsider.com/game-soundtracks/album/forspoken-3cd-set-2023', async function (error, response, body) {
    console.log(`Page loaded`);
    const $ = cheerio.load(body);
    const links = $("#songlist .playlistDownloadSong a")
    console.log(`Je charge la liste`);
    for (let index = 0; index < links.length; index++) {
        const element = links[index];
        const antichambreURL = element.attribs.href
        console.log(`Je tente de charger l'antichambre`);
        request(`${radical}${antichambreURL}`, async (err, res, acBody) => {
            console.log(`J'ai chargé l'antichambre`);
            const antichambreDOM = cheerio.load(acBody)
            const tresorLinks = antichambreDOM('#pageContent a')
            const boldTexts = antichambreDOM('#pageContent [align=left] b')
            const currentTitle = boldTexts[boldTexts.length - 1].children[0].data;
            
            for (let tresorLinkIndex = 0; tresorLinkIndex < tresorLinks.length; tresorLinkIndex++) {
                const tresorLink = tresorLinks[tresorLinkIndex];
                const tresorLinkURL = tresorLink.attribs.href
                if (tresorLinkURL.match(treasureRegex)) {
                    console.log(tresorLinkURL);
                    const file = fs.createWriteStream(`output/${index} - ${currentTitle}.mp3`);
                    https.get(tresorLinkURL, function(response) {
                        response.pipe(file);
                        file.on("finish", () => {
                            file.close();
                            console.log("Download Completed");
                        });
                    });
                    await sleep(10000)
                }            
            }
        })
        await sleep(10000)
    }
});
