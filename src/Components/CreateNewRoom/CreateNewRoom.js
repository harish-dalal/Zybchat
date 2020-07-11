import React, { Component} from 'react'
import firebase from 'firebase'
import {TextField , IconButton, Input , withStyles , Button , CircularProgress} from '@material-ui/core'
import {PhotoCamera} from '@material-ui/icons'
import ImageTools from '../ImageResize/ImageTools'
// import {withStyles} from '@material-ui/coreimport { firestore } from 'firebase';

import './createnewroom.css'
import { FirebaseContext } from '../API/firebase';

const CssTextField = withStyles({
    root: {
      '& .MuiInput-underline:before': {
        borderBottomColor: 'white',
      },
      '& .MuiFormLabel-root' : {
          color : '#969696'
      },
      '& .MuiFormLabel-root.Mui-focused' : {
          color : '#3f51b5'
      }
    },
  })(TextField);

class CreateNewRoom extends Component{
    constructor(){
        super()
        this.state = {
            chatRoomName : '',
            chatRoomMoto : '',
            image : null,
            imageBlob : null,
            loading : false,
        }
        this.setthestate = this.setthestate.bind(this)
    }

    createNewRoom(event){
        event.preventDefault()
        let nameVar = this.state.chatRoomName.trim()
        let motoVar = this.state.chatRoomMoto.trim()
        if(nameVar.length===0 || motoVar.length===0) return;
        //uploadin profile pic first if its there
        this.setState({loading : true})
        if(this.state.imageBlob){
            let date = new Date()
            console.log(typeof this.state.imageBlob)
            let storageRef = this.context.storage.ref('/ChatRoomImages/' + nameVar + date.getTime())
            let uploadTask = storageRef.put(this.state.imageBlob).then(snap=>{
                snap.ref.getDownloadURL().then(url=>{
                    //image uploaded and url is the image url call the data upload function
                    this.createNewRoomFirestore(event , nameVar , motoVar , url)
                }).catch(err=>console.log(err))
            }).catch(err=>console.log(err))
        }
        else{
           this.createNewRoomFirestore(event , nameVar , motoVar , null)
        }

    }

    createNewRoomFirestore(event , nameVar , motoVar , url){
        
        let chatref = this.context.db.collection('ChatRooms')
        let userref = this.context.db.collection('Users').doc(this.context.auth.currentUser.uid)
        let userLastSeenref = userref.collection('LastSeenMessages')
        chatref.add({
            chatRoomName : nameVar,
            moto : motoVar, 
            timeStamp : firebase.firestore.Timestamp.now(),
            photoUrl : url,
            totalUsers : 1,
            users : {
                [this.context.auth.currentUser.uid] : {
                    userId : this.context.auth.currentUser.uid,
                    userName : this.context.auth.currentUser.displayName,
                    userProfile : this.context.auth.currentUser.photoURL,
                    userEmail : this.context.auth.currentUser.email,
                }
            },
            admin : {[this.context.auth.currentUser.uid] : true,},
        }).then(doc=>{
            console.log(doc)
            let batch = this.context.db.batch()
            batch.set(userref , {
                chatRooms : {
                    [doc.id] : {
                        name : nameVar,
                        photoUrl : url,
                        jointimeStamp : firebase.firestore.Timestamp.now(),
                    }
                }
            },{merge : true})
            batch.set(userLastSeenref.doc(doc.id) , {
                lastSeen : firebase.firestore.Timestamp.now()
            })

            batch.commit().then(()=>{
                this.setState({
                    chatRoomName : '',
                    chatRoomMoto : '',
                    image : null,
                    loading : false,
                })
                console.log('created room successfully')
            }).catch(err=>console.log(err))
        }).catch(err=>{
            this.setState({loading : false})
            console.log(err)})
    }

    updateInput(e){
        if(e.target.name === 'chatroom-name') this.setState({chatRoomName : e.target.value})
        else if(e.target.name === 'chatroom-moto') this.setState({chatRoomMoto : e.target.value})
    }

    previewImageAndResize(event){
        ImageTools.resize(event.target.files[0], {
            width: 200, // maximum width
            height: 200 // maximum height
        }, (blob , resize)=>this.setthestate(blob , resize));
    }

    setthestate(blob , resize){
        console.log(blob)
        this.setState({image : URL.createObjectURL(blob) , imageBlob : blob})
    }

    render(){
        console.log(typeof this.state.image)
        return(
            <div style = {{color : 'white'}}>
                <form className = 'create-room-form' onSubmit = {this.createNewRoom.bind(this)}>
                    <div style = {{backgroundImage : `url(${this.state.image})`}}  className = 'image-preview-circle'>
                        <input accept="image/*" style={{display : 'none'}} onChange = {this.previewImageAndResize.bind(this)} id="icon-button-file" type="file" />
                        <label id='label-for-camera-button' htmlFor="icon-button-file">
                            <IconButton color='primary' aria-label="upload picture" component="span">
                            <PhotoCamera fontSize = 'large'/>
                            </IconButton>
                        </label>
                    </div>
                    <br/>
                    <CssTextField 
                        name = 'chatroom-name'
                        id = 'chatroom-name' 
                        label = 'Chatroom name' 
                        autoComplete = 'off'
                        required
                        onChange = {this.updateInput.bind(this)}
                        value = {this.state.chatRoomName}
                        InputProps = {{
                            style : {
                                color : '#c3c3c3',
                            },
                            form : {
                                autoComplete : 'off'
                            }
                        }}
                    />
                    <br/>
                    <CssTextField
                        name = 'chatroom-moto'
                        id = 'chatroom-moto'
                        label = 'Moto'
                        multiline
                        required
                        value = {this.state.chatRoomMoto}
                        rowsMax = {3}
                        onChange = {this.updateInput.bind(this)}
                        InputProps = {{
                            style : {
                                color : '#c3c3c3'
                            }
                        }}
                    />
                    <br/>
                    <div>
                    <Button type = 'submit' color="primary" disabled={this.state.loading}>Create Room</Button>
                    {this.state.loading && <CircularProgress size={24}  />}
                    </div>
                </form>
            </div>
        )
    }
}

CreateNewRoom.contextType = FirebaseContext
export default CreateNewRoom