require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns").promises;

const urlModel = require("./mongo.js"); // URL model for MongoDB

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/shorturl/:shorturl", function (req, res) {
  urlModel
    .findOne({ shortUrl: req.params.shorturl })
    .then((urlEntry) => {
      if (!urlEntry) {
        return res.status(404).json({ error: "URL not found" });
      }
      res.redirect(urlEntry.url);
    })
    .catch((err) => {
      console.error("Error retrieving URL:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.post("/api/shorturl", async function (req, res) {
  const originalUrl = req.body.url;

  if (!originalUrl) {
    return res.status(400).json({ error: "url is required" });
  }

  if (!/^https?:\/\//.test(originalUrl)) {
    return res.status(400).json({ error: "invalid url" });
  }

  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (error) {
    return res.status(400).json({ error: "invalid url" });
  }
  try {
    await dns.lookup(hostname);

    const shortUrl = Math.floor(Math.random() * 1000);

    const urlEntry = new urlModel({
      url: originalUrl,
      shortUrl: shortUrl.toString(),
    });
    await urlEntry.save();
    res.json({ original_url: originalUrl, short_url: shortUrl });
  } catch (error) {
    return res.status(400).json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
