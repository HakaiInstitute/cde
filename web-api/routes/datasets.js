var express = require("express");
var router = express.Router();
const db = require("../db");
const cache = require("../utils/cache");

router.get("/", cache.route(), async function (req, res, next) {
  const SQL = `SELECT title, 
                      pk,
                      organization_pks,
                      platform,
                      json_build_object('en', title, 'fr', title_fr) title_translated
                      FROM cde.datasets
                      ORDER BY UPPER(title)`;

  res.send((await db.raw(SQL)).rows);
});

module.exports = router;
