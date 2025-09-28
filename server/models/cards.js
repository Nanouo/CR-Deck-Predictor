const fs = require ("fs");

let data = JSON.parse(fs.readFileSync("server/localdata/cards.json", "utf8"));
// Normalizes max card level to 15
data = data.map(card => ({...card,maxLevel:15}));
module.exports = data; 