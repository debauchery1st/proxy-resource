const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const request = require("request");
const app = express();
const palette = require("./api/palette");
try {
  require("dotenv").config();
} catch {
  console.log("not loading dotenv");
}

app.use(cors());
app.use(helmet());
app.get("/", (req, res) => {
  res.status(200).send("OK");
});
app.get("/palettes/ch/:number", (req, res) => {
  // return HTML color codes
  const result = { url: "error" };
  const n = Number(req.params.number);
  if (n > 0) {
    result.url = `${process.env.CHP_URL}${n}`;
  }
  // result contains possibly valid url. check if db record exists
  try {
    palette.find({ id: n }).then((existing) => {
      // try to find in db
      if (existing && existing.id === n) {
        res.status(200).json(existing); // return existing record
      }
      // otherwise fetch from colorHunt
      request(result, (err, response, body) => {
        if (err || response.statusCode !== 200) {
          return res.status(500).json({ type: "error", message: err.message });
        }
        const txt = body
          .split("\n")
          .filter((line) => line.match(/itemer/))
          .map((i) => i.split(";")[0])[0]
          .split(",")[2]
          .replace(" ", "");
        const colorString = txt.replace(/[^a-z0-9]/gi, "");
        const colorOne = `#${colorString.substring(0, 6)}`;
        const colorTwo = `#${colorString.substring(6, 12)}`;
        const colorThree = `#${colorString.substring(12, 18)}`;
        const colorFour = `#${colorString.substring(18)}`;
        const origin = result.url;
        const colors = JSON.stringify([
          colorOne,
          colorTwo,
          colorThree,
          colorFour,
        ]);
        const id = req.params.number;
        const record = { id, colors, origin };
        // const table = "palette";
        palette.add(record).then((result) => {
          console.log(`added palette ${result}`);
          res
            .status(200)
            .json({ origin, colorOne, colorTwo, colorThree, colorFour });
        }); // end palette.add
      }); // end request
    }); // end pallete.find
  } catch {
    console.log("no existing record, retrieve with url");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`listening @ ${PORT}`));
