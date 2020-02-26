import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Spotify from 'spotify-web-api-js';

const spotifyWebApi = new Spotify();

class App extends Component {
  constructor(){
    super();
  const params = this.getHashParams();
  this.state ={
    loggedIn: params.access_token ? true : false,
    trackName: [],
    trackArtist: []
  }
  if (params.access_token){
    spotifyWebApi.setAccessToken(params.access_token)
  }
}
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  getNowPlaying(){
    var i;
    var name;
    var artist;
    var combined;
    spotifyWebApi.getMyTopTracks()
    .then((response) => {
      for (i = 0; i < 20; i++){
        name = response.items[i].name
        artist = response.items[i].artists[0].name
        combined = artist.concat(" - ", name)
      this.setState(prevState => ({
        trackName: [...prevState.trackName, combined],
//        trackArtist: [...prevState.trackArtist, artist],
      }
    )
  )}
})
}
getLogin(){
  var express = require('express'); // Express web server framework
  var request = require('request'); // "Request" library
  var cors = require('cors');
  var querystring = require('querystring');
  var cookieParser = require('cookie-parser');

  var client_id = 'c893a2dcd3f54b0386869ffc9c974b4b'; // Your client id
  var client_secret = 'edc9ea2d01e440f09f1cbac99b081fbf'; // Your secret
  var redirect_uri = 'http://archit-soni.github.io/replay'; // Your redirect uri

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  var stateKey = 'spotify_auth_state';

  var app = express();

  app.use(express.static(__dirname + '/public'))
     .use(cors())
     .use(cookieParser());

  app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-playback-state user-top-read user-read-recently-played';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

  app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };

      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
              refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('http://architsoni.com/replay' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });

  app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });
}

render(){
  return (
    <div className="App">
        <button onClick = {() => this.getLogin()}>Login with Spotify</button>
      <button onClick={() => this.getNowPlaying()}>
       Check Now Playing
      </button>
      <div> <div className="Tracks">  { this.state.trackName.map(name => <div> {name} </div>)}</div><br />
      </div>

    </div>
  );
 }
}
export default App;
