const fs = require('fs');
const cheerio = require('cheerio');

const letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
const domain = 'https://www.britannica.com';
const urlBase = domain + '/dictionary/eb/3000-words/alpha/';
const dictionary = [];

// fetch(urlBase + 'a').then(r => r.text()).then(body => {
//   const $ = cheerio.load(body);
//   $('.a_words a').toArray().forEach(a => {
//     const wordUrl = a.attribs.href;
//     fetch(domain + wordUrl).then(r => r.text()).then(wordPage => {
//       const $$ = cheerio.load(wordPage);
//       const word = $$('#ld_entries_v2_mainh').text().trim();
//       const entries = $$('#ld_entries_v2_all .entry');
//       entries.each((i, el) => {
//         const entry = $$(el);
//         const defs = entry.find('.def_text').map((ii, e) => $$(e).text()).toArray();
//         if (defs.length > 0) {
//           dictionary.push({
//             word,
//             pos: entry.find('.hw_d .fl').text().trim(),
//             defs,
//           });
//         }
//       });
//     });
//   });
// });

// const fetches = letters.map(letter => {
// const fetches = letters.reduce((result, letter) => {
letters.forEach(async (letter) => {
  console.log(letter);
  const body = await fetch(urlBase + letter).then(r => r.text());
  const $ = cheerio.load(body);
  // $('.a_words a').toArray().forEach(async (a) => {
  const pageFetches = $('.a_words a').toArray().reduce((result, a) => {
    const wordUrl = a.attribs.href;
    console.log(wordUrl);
    // const wordPage = await fetch(domain + wordUrl).then(r => r.text());
    const wordFetch = fetch(domain + wordUrl).then(r => r.text()).then(wordPage => {
      const $$ = cheerio.load(wordPage);
      const word = $$('#ld_entries_v2_mainh').text().trim();
      const entries = $$('#ld_entries_v2_all .entry');
      entries.each((i, el) => {
        const entry = $$(el);
        const pos = entry.find('.hw_d .fl').text().trim();
        const defs = entry.find('.def_text').map((ii, e) => $$(e).text()).toArray();
        if (defs.length > 0) {
          const item = { word, pos, defs };
          dictionary.push(item);
          console.log('added ' + word + '(' + pos + ')');
          return item;
        }
        return null;
      });
    });
    result.push(wordFetch);
    return result;
  }, []);
  await Promise.all(pageFetches).then(() => console.log('finished ' + letter, 'There are now ' + dictionary.length + ' words'));
});

setTimeout(() => {
  console.log(dictionary.length + ' words');
  dictionary.sort((a, b) => {
    if (a.word === b.word) {
      if (a.pos === b.pos) {
        return 0;
      }
      return a.pos > b.pos ? 1 : -1;
    }
    return a.word > b.word ? 1 : -1;
  });
  fs.writeFileSync('./dictionary.json', JSON.stringify(dictionary));

  const byPartOfSpeech = dictionary.reduce((result, entry) => {
    if (typeof result[entry.pos] === 'undefined') {
      result[entry.pos] = [];
    }
    entry.defs.forEach(def => {
      result[entry.pos].push({
        word: entry.word,
        def,
      });
    });
    return result;
  }, {});
  fs.writeFileSync('./partsOfSpeech.json', JSON.stringify(byPartOfSpeech));
}, 30000);