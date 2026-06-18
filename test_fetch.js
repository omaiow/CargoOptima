// test_fetch.js
async function test() {
  try {
    const res = await fetch('https://www.autoindustriya.com/fuel-prices.html', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
