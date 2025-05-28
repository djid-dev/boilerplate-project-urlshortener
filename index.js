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
        return res.json({ error: "URL not found" });
      }
      res.redirect(urlEntry.url);
    })
    .catch((err) => {
      console.error("Error retrieving URL:", err);
      res.json({ error: "Internal Server Error" });
    });
});

app.post("/api/shorturl", async function (req, res) {
  const originalUrl = req.body.url;

  if (!originalUrl) {
    return res.json({ error: "invalid url" });
  }

  if (!/^https?:\/\/[^/]+/.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }

  let hostname, url;
  try {
    url = new URL(originalUrl);

    if (!url.hostname) {
      console.log("Invalid URL: No hostname found");
      return res.json({ error: "invalid url" });
    }

    if (!url.hostname.includes(".")) {
      return res.json({ error: "invalid url" });
    }

    hostname = url.hostname;
  } catch (error) {
    console.log("Invalid URL: Parsing error", error);
    return res.json({ error: "invalid url" });
  }

  try {
    await dns.lookup(hostname);

    

    const shortUrl = Math.floor(Math.random() * 1000).toString();

    const urlEntry = new urlModel({
      url: url.href,
      shortUrl: shortUrl,
    });
    await urlEntry.save();
    res.json({ original_url: url.href, short_url: shortUrl });
  } catch (error) {
    console.log("Invalid URL: DNS lookup failed", error);
    return res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
