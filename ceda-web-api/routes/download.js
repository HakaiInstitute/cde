require("dotenv").config();

const { v4: uuidv4 } = require("uuid");
var express = require("express");
var router = express.Router();
const db = require("../db");
const createDBFilter = require("../utils/dbFilter");
const { eovGrouping } = require("../utils/grouping");

router.get("/", async (req, res, next) => {
  const {
    timeMin,
    timeMax,
    latMin,
    latMax,
    depthMin,
    depthMax,
    lonMin,
    lonMax,
    eovs,
    email,
    polygon,
  } = req.query;

  const filters = createDBFilter(req.query);
  // const wkt
  const wktPolygon =
    "POLYGON((" +
    JSON.parse(polygon)
      .map(([lat, lon]) => `${lat} ${lon}`)
      .join() +
    "))";

  const SQL = `
        with profiles_subset as (
        select d.erddap_url, d.dataset_id,d.profile_variable,d.cdm_data_type, d.ckan_id ckan_id, 'https://catalogue.cioos.ca/dataset/' ckan_url  FROM cioos_api.profiles p
        JOIN cioos_api.datasets d ON p.dataset_pk =d.pk
        where
        ${filters ? filters + " AND " : ""} 

        ST_Contains(ST_GeomFromText('${wktPolygon}',4326),ST_Transform(geom,4326)) is true
        group by d.pk)
      select json_agg(t) from profiles_subset t;`;

  console.log(SQL);
  let count = 0;

  // Make sure they are a registered user
  const allowedUsers = (await db("cioos_api.allowed_users")).map(
    (e) => e.email
  );
  if (!allowedUsers.includes(email)) {
    res.send(403);
    return next();
  }

  try {
    const tileRaw = await db.raw(SQL);
    const tile = tileRaw.rows[0];
    if (tile.json_agg && tile.json_agg.length) {
      const downloaderInput = {
        user_query: {
          time_min: timeMin,
          time_max: timeMax,
          lat_min: Number.parseFloat(latMin),
          lat_max: Number.parseFloat(latMax),
          lon_min: Number.parseFloat(lonMin),
          lon_max: Number.parseFloat(lonMax),
          depth_min: Number.parseFloat(depthMin),
          depth_max: Number.parseFloat(depthMax),
          polygon_region: wktPolygon,
          eovs: eovs
            .split(",")
            .map((eov) => eovGrouping[eov])
            .flat(),
          email,
          zip_filename: `ceda_download_${uuidv4().substr(0, 6)}.zip`,
        },
        cache_filtered: tile.json_agg,
      };
      // add to the jobs queue

      await db("cioos_api.download_jobs").insert({
        email: email,
        downloader_input: downloaderInput,
      });
      count = tile.json_agg.length;
    }
    res.send({ count });
  } catch (e) {
    res.status(404).send({
      error: e.toString(),
    });
  }
});

module.exports = router;
