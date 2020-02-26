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

render(){
  return (
    <div className="App">
      <a href='http://localhost:8888'>
        <button>Login with Spotify</button>
      </a>
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
