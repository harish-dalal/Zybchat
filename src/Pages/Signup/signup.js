import React from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { FirebaseContext } from '../../Components/API/firebase/'
import './firebaseUI.css'
import './signup.css'
//todo : dont display signup if already signed in

const signUp = () => (
  <FirebaseContext.Consumer> 
  {firebase => 
    {return (
      <div className = 'sign'>
      <div className = 'sign-transparent-div'>
        <h1>ZYBchat</h1>
        <StyledFirebaseAuth uiConfig={firebase.uiConfig} firebaseAuth={firebase.auth}/>
      </div>
      </div>
    );
  }}  
  </FirebaseContext.Consumer>
)

export default signUp;
