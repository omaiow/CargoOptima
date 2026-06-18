const https = require('https');
https.get('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.globalpetrolprices.com/Philippines/diesel_prices/'), (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
        const json = JSON.parse(data);
        const html = json.contents;
        const match = html.match(/Philippine Peso.*?<b>([0-9\.]+)\s*<\/b>/is) || html.match(/([0-9\.]+)\s*Philippine Peso/is) || html.match(/value:\s*([0-9\.]+)/is);
        if (match) {
            console.log('Found price:', match[1]);
        } else {
            console.log('No match. HTML length:', html ? html.length : 0);
        }
    } catch (e) {
        console.error(e);
    }
  });
}).on('error', console.error);
