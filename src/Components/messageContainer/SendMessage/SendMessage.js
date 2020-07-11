import React , {Component} from 'react'
import {TextField , IconButton , Input} from '@material-ui/core'
// import {sendRoundedIcon} from '@material-ui/icons'
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import './sendmessage.css'
import { FirebaseContext } from '../../API/firebase';
import firebase from 'firebase'


class SendMessage extends Component{
    constructor(props){
        super(props)
        this.state = {
            message : '',
        }
        // props => chatroomid
        this.sendMessage = this.sendMessage.bind(this)
    }


    onMessageInput(e){
        if(e.target)
        this.setState({message : e.target.value})
    }

    sendMessage(){
        // event.preventDefault()
        let msg = this.state.message.trim();
        if(msg.length === 0) return
        this.setState({message : ''})
        this.context.db.collection('ChatRooms').doc(this.props.chatRoomId.trim()).collection('Messages').doc().set({
            message : msg,
            timeStamp : firebase.firestore.Timestamp.now(),
            user : {
                userId : this.context.auth.currentUser.uid,
                userName : this.context.auth.currentUser.displayName,
                userPic : this.context.auth.currentUser.photoURL,
                userEmail : this.context.auth.currentUser.email,
            },
        }).then()
        .catch(err=>console.log('error '+err))
    }

    render(){
        return(
            <div>
                <form>
                    <TextField
                        style = {{width : '80%'}}
                        InputProps = {{
                            style : {
                                padding : '15px',
                                color : '#dadada',
                            }
                        }}
                        id="outlined-textarea"
                        // label="Multiline Placeholder"
                        placeholder="Enter message"
                        multiline
                        rowsMax = {3}
                        rows = '1'
                        variant="outlined"
                        value = {this.state.message.trimLeft()}
                        onChange = {this.onMessageInput.bind(this)}
                        onKeyDown = {(e)=>{
                            
                            if(!e.shiftKey && e.key === 'Enter') this.sendMessage()
                        }}
                        />
                    <IconButton type = 'button' onClick = {this.sendMessage}>
                        <SendRoundedIcon color = 'primary'/>
                    </IconButton>
                </form>
            </div>
        )
    }
}

SendMessage.contextType = FirebaseContext
export default SendMessage;