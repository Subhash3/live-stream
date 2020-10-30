import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CurrentUserProvider from './contexts/CurrentUserProvider.jsx'
import LoginForm from './components/LoginForm/LoginForm.jsx'
import Landing from './components/Landing/Landing.jsx'
import ChatRoom from './components/ChatRoom/ChatRoom.jsx'
// import Room from './components/Room/Room.jsx'
// import PeerStreamProvider from './contexts/PeerStreamProvider.jsx'
import MessagesProvider from './contexts/MessagesContext.jsx'

function App() {
  return (
    <CurrentUserProvider>
      {/* <PeerStreamProvider> */}
      <div className="App">
        <Router>
          <Switch>
            <Route exact path='/' component={Landing}></Route>
            <Route path='/login' component={LoginForm} ></Route>
            <MessagesProvider>
              <Route path='/room/:roomID' component={ChatRoom} ></Route>
            </MessagesProvider>
          </Switch>
        </Router>
      </div>
      {/* </PeerStreamProvider> */}
    </CurrentUserProvider>
  );
}

export default App;
