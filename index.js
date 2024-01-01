const axios = require("axios").default;
const cheerio = require("cheerio");
const inq = require("@inquirer/prompts");

const BASE = {
  transfer:
    "https://www.cb.gov.sy/index.php?page=list&ex=2&dir=exchangerate&lang=1&service=2&act=1206",
  official:
    "https://www.cb.gov.sy/index.php?page=list&ex=2&dir=exchangerate&lang=1&service=4&act=1207",
  military:
    "https://www.cb.gov.sy/index.php?page=list&ex=2&dir=exchangerate&lang=1&service=1&act=779",
};

const options = {
  message:
    "Hello From Central Bank scraper\nwhat type of exchange rates do you want: ",
  choices: [
    {
      description: "The Transfer Rates",
      value: "transfer",
      name: "Transfer Rates",
    },
    {
      description: "The Official Rates",
      value: "official",
      name: "Official",
    },
    {
      description: "The Military Rates",
      value: "military",
      name: "Military",
    },
  ],
};

inq.select(options).then((choice) => getPrice(BASE[choice]));

async function getPrice(base) {
  try {
    const res = await axios.get(base, { timeout: 1000 * 30 });
    const page = res.data;
    const $ = cheerio.load(page);
    let dates = $(".about-info > .law > :is(.bd1, .bd2) > div:nth-child(1)");
    let prices = $(".about-info > .law > :is(.bd1, .bd2) > div:nth-child(2)");

    dates = dates
      .text()
      .trim()
      .split(" ")
      .filter((el) => el && el);
    prices = prices
      .text()
      .trim()
      .split(" ")
      .filter((el) => el && el);

    const data = dates.map((el, idx) => {
      return { date: el.trim(), price: +prices[idx] };
    });

    console.table(data);
  } catch (e) {
    return e && console.log("Error => " + e.code);
  }
}
