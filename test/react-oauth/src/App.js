import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      config: null,
    }
    var configUrl = '/api/app-config';
    fetch(configUrl, {
      credentials: 'include'
    })
      .then(resp => {
        if (resp.ok) {
          resp.json()
            .then(body => {
              if (body.data) this.setState({ config: body.data })
              else console.log(body.errors)
            })
        }
      })
    var url = '/api/users/me';
    fetch(url, {
      credentials: 'include'
    })
      .then(resp => {
        if (resp.ok) {
          resp.json()
            .then(body => {
              this.setState({ user: body.data })
            })
        }
        else {
          this.setState({ user: null })
        }
      })
  }

  //
  // Handle return response from OAuth authentication
  // provider - OAuth provider ('facebook' or 'google')
  // response - the OAuth response from the provider. Will contain an accessToken
  //            granted by the provider.
  // 
  //  Send the access token to our API to validate authenticiy with the provider, which
  // will result in a user record either being looked up in our database, or created.
  //
  loginResponse = (provider, response) => {
    //
    // If an access token is received, send it to our API for authentication and user 
    // lookup/creation
    //
    // The fetch sequence should probably be wrapped into an API handler module, this
    // is here for an example sequence
    //
    if (response.accessToken) {
      var url = '/api/login/' + provider + '/token?access_token=' + response.accessToken;
      fetch(url, { credentials: 'include' })
        .then(resp => {
          if (resp.ok) return resp.json()
          else throw Error(resp.statusText);
        })
        .then(body => {
          // We have a user object,  so set the state with the user
          this.setState({ user: body.data })
        })
        .catch(err => {
          alert(err);
        })
    } else {
      // No access token, OAuth failed... do something (alert for now)
      alert(provider + " login failed");
    }
  }

  logout() {
    fetch('/api/logout', { credentials: 'include' })
      .then(resp => {
        if (resp.status) {
          return resp.json();
        }
      })
      .then(body => {
        this.setState({ user: body.data })
      })
  }

  render() {
    var body = null;
    if (this.state.user) {
      var welcome = this.state.user.isNew ? "You are a new user. Set up your profile" : "Welcome Back!";
      body =
        <div>
          <div>You are logged in as {this.state.user.first_name + ' ' + this.state.user.last_name}</div>
          <div>{welcome}</div>
          <img src={this.state.user.image}></img>
          <div>
            <a href={'#'} onClick={this.logout.bind(this)}>Logout</a>
          </div>
          <div id='profile'>
            <div>Profile</div>
            <pre>{JSON.stringify(this.state.user, null, 2)}</pre>
          </div>
        </div>
    } else if (this.state.config) {
      body = <div>
        <FacebookLogin
          appId={this.state.config.oauth.facebook.clientID}
          autoLoad={false}

          callback={this.loginResponse.bind(this, 'facebook')} />
        <GoogleLogin
          clientId={this.state.config.oauth.google.clientID}
          buttonText="Login with Google"
          autoLoad={false}
          onSuccess={this.loginResponse.bind(this, 'google')}
          onFailure={this.loginResponse.bind(this, 'google')}
        />,
      </div>
    } else body = <div> Loading </div>
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        {body}
      </div>
    );
  }
}

export default App;
