import React, { Component } from 'react';
import Signup from './Pages/Signup/signup'
import Home from './Components/Home/Home'
import './App.css';
import { FirebaseContext } from './Components/API/firebase';
import {Link} from 'react-router-dom'

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class App extends Component {
  constructor(){
    super()
    this.state = {
      user : null,
      dialogOpen : false,
    }
    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.signOut = this.signOut.bind(this)
  }

  componentDidMount(){
    this.context.auth.onAuthStateChanged(usr=>{
      if(usr) this.setState({user : usr})
      else this.setState({user : 'no-user'})
    })
  }

  signOut(){
    this.context.auth.signOut().then(()=>console.log('successfully signed out')).catch(err=>console.log(err))
  }

  handleClickOpen(value){
    this.setState({dialogOpen : value})
  }

  render(){
    
    console.log(this.state.user)
    return(
      <div className = 'App'>
        {
          this.state.user?
          this.state.user !== 'no-user'?
          <div>
            <div className = 'navbar-home'>
              <Link to = '/'><div className = 'navbar-title'>ZYBchat</div></Link>
              <Dialog
                open={this.state.dialogOpen}
                onClose={()=>this.handleClickOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">{"Really want to Sign Out"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    You won't be getting any notifications regarding any new message. Are you sure?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={()=>{this.handleClickOpen(false); this.signOut()}} color="primary">
                    let me go!!
                  </Button>
                  <Button onClick={()=>this.handleClickOpen(false)} color="primary" autoFocus>
                    I'll Stay
                  </Button>
                </DialogActions>
              </Dialog>
              <div style = {{display : 'flex' ,flexDirection : 'row'}}>
                <span style ={{fontSize : '.8rem' , cursor : 'pointer' , color : '#b5b5b5'}} onClick = {()=>this.handleClickOpen(true)}>SIGN OUT</span>
                <div className = 'navbar-user-image' style={{backgroundImage : this.state.user !== 'no-user' && `url(${this.state.user.photoURL})`}}/>
              </div>
            </div>
            <Home/>
          </div>
          :<Signup/>
          :<div className = 'loading-widget'>Loading...</div>
        }
      </div>
    )
  }
}

App.contextType = FirebaseContext
export default App;
