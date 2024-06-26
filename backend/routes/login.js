const express = require("express");
const querystring = require("querystring");
const router = express.Router();
//const axios = require("axios");

require("dotenv").config({ path: "../.env" });
const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

router.get("/login", function (req, res) {
  var scope =
    "user-read-private user-read-email playlist-modify-public playlist-modify-private";

  // TODO: API docs recommend a state string for security. Write a quick func to gen a random string

  // Redirect the user to Spotify for login/authentification
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        // state: state,
      }),
  );
});

router.get("/callback", function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;

  if (state === null) {
    res.redirect(
      "/#" +
        querystring.stringify({
          error: "state_mismatch",
        }),
    );
  } else {
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: "authorization_code",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(client_id + ":" + client_secret).toString("base64"),
      },
      json: true,
    };
  }
});

router.get("/refresh_token", (req, res) => {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  axios.post(authOptions, (err, response, body) => {
    if (!err && res.statusCode === 200) {
      var access_token = body.access_token,
        refresh_token = body.refresh_token;

      res.send({
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
  });
});

module.exports = router;
