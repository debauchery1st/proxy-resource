const request = require("request");

/**
 *
 * @param {Number} id colorHunt schema palette number
 * @param {Object} result { url }
 * @param {*} tbl knex db table instance
 * @param {*} res response
 *
 */
function GetPalette({ id, result, tbl, res }) {
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
    const colors = JSON.stringify([colorOne, colorTwo, colorThree, colorFour]);
    const record = { id, colors, origin };
    tbl
      .add(record)
      .then((result) => {
        console.log(`added palette ${result}`);
        res.status(200).json(record);
      })
      .catch((err) => {
        console.log(err);
        console.log("catch from add");
      }); // end palette.add
  });
}

module.exports = GetPalette;
