import React , {Component} from 'react'
import {FirebaseContext} from '../../API/firebase/'
import SendMessage from '../SendMessage/SendMessage'
import {withRouter} from 'react-router-dom'
import Message from './Message'
import './viewmessage.css'
import { IconButton , Button } from '@material-ui/core'
import firebase from 'firebase'
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class ViewMessage extends Component{
    constructor(props){
        super(props)
        //props=>chatRoomid
        this.state = {
            messages : [],
            chatRoomId : this.props.location.pathname.split('/')[2],
            startDoc : null,
            endDoc : null,
            listeners : [],
            users : null,
            userInRoom : false,
            chatRoom : null,
            usersList : false,
        }

    }

    getChatRoom(Id){
        if(Id.trim().length === 0 ) return;
        this.unsubscribeChatRoom = this.context.db.collection('ChatRooms').doc(Id.trim()).onSnapshot(snap=>{
            if(typeof snap.data() === 'undefined') alert('no Such room exist')
            else{
                let chatroom = snap.data()
                this.setState({chatRoom : chatroom})
                if(this.context.auth.currentUser){
                    if(chatroom.users.hasOwnProperty(this.context.auth.currentUser.uid)) this.setState({userInRoom : true})
                    else this.setState({userInRoom : false})
                }
            }
        })
    }

    joinChatRoom(Id){
        if(Id.trim().length === 0) return
        Id = Id.trim()
        let batch = this.context.db.batch()
        let chatroomref = this.context.db.collection('ChatRooms').doc(Id)
        let userref = this.context.db.collection('Users').doc(this.context.auth.currentUser.uid)
        let lastseenref = userref.collection('LastSeenMessages').doc(Id)

        batch.set(chatroomref , {
            users : {
                [this.context.auth.currentUser.uid]:{
                    userId : this.context.auth.currentUser.uid,
                    userName : this.context.auth.currentUser.displayName,
                    userProfile : this.context.auth.currentUser.photoURL,
                    userEmail : this.context.auth.currentUser.email,
                }
            }
        } , {merge : true})
        batch.set(userref , {
            chatRooms : {
                [Id] : {
                    jointimeStamp : firebase.firestore.Timestamp.now(),
                    name : this.state.chatRoom.chatRoomName,
                    photoUrl : this.state.chatRoom.photoUrl,
                }
            }
        },{merge : true})

        batch.set(lastseenref , {
            lastSeen : firebase.firestore.Timestamp.now()
        })

        batch.commit().then(snap=>console.log('user added to room successfully')).catch(err=>console.log('error in adding user to room '+err))
    }

    getMessages(Id){
        if(Id.trim().length === 0) return
        let listener = this.context.db.collection('ChatRooms').doc(Id).collection('Messages').orderBy('timeStamp' , 'desc').limit(10).onSnapshot(snap=>{
            let msg = []
            snap.docs.forEach(doc=>{
                msg.push(doc.data())
            })
            this.setState({...{messages : msg} , ...{startDoc : snap.docs[snap.docs.length - 1]}})
            if(msg.length){
                //setting last seen of user to the current msg received 
                if(this.context.auth.currentUser)
                this.context.db.collection('Users').doc(this.context.auth.currentUser.uid)
                .collection('LastSeenMessages').doc(Id).set({
                    lastSeen : msg[0].timeStamp
                }).then().catch(err=>console.log('error '+err))
            }
        })
        this.setState(prevState => ({listeners : [...prevState.listeners , listener]}))
    }

    getMoreMessages(Id){
        let listener = this.context.db.collection('ChatRooms').doc(Id).collection('Messages').orderBy('timeStamp' , 'desc').startAfter(this.state.startDoc).limit(10).onSnapshot(snap=>{
            let msg = []
            if(typeof snap.docs[snap.docs.length-1] === 'undefined') {
                return;
            }
            else{
            snap.docs.forEach(doc=>{
                msg.push(doc.data())
            })
            this.setState(prevState=>({messages : [...prevState.messages , ...msg] , startDoc : snap.docs[snap.docs.length - 1]})  )

            this.setState(prevState=>({listeners : [...prevState.listeners , listener]}))
            }
        })
    }

    handleScroll = (e) => {
        if (!e.target.scrollTop){
            this.getMoreMessages(this.state.chatRoomId)
        }
      }

    handleDialog(value){
        this.setState({usersList : value})
    }

    componentDidMount(){
        window.addEventListener('scroll' , this.bottomOfPage)
        this.state.listeners.forEach(list=>{
            list()
        })
        this.getChatRoom(this.state.chatRoomId)
        this.getMessages(this.state.chatRoomId)
    }


    componentWillUnmount(){
        this.state.listeners.forEach(list=>{
            list()
        })
    }


    componentWillReceiveProps(nextProps){
        
        this.state.listeners.forEach(list=>{
            list()
        }) // removing previous snapshot listener wheneve chat room is changed (props change)
        this.setState({chatRoomId : nextProps.location.pathname.split('/')[2]})
        if(this.context.auth.currentUser){
        this.getMessages(nextProps.location.pathname.split('/')[2])
        this.getChatRoom(nextProps.location.pathname.split('/')[2])}
    }

    render(){
        // const Date = this.props.data.timeStamp.toDate().toDateString().split(' ')
        return(
            <div className = 'message-area'>

                {   this.context.auth.currentUser?
                    this.state.userInRoom?
                    <div style = {{height : '100%'}}>
                    <div className = 'chatroom-topbar'>
                        <div className='bar-image' style = {{backgroundImage : this.state.chatRoom && `url(${this.state.chatRoom.photoUrl})`}}></div>
                        <div className = 'bar-room-name'>{this.state.chatRoom && this.state.chatRoom.chatRoomName}</div>
                        <div style = {{marginLeft : 'auto'}}>
                            {/* get list of all members */}
                            <IconButton type = 'button' onClick = {()=>this.handleDialog(true)}>
                                <GroupIcon />
                            </IconButton>
                            <Dialog
                            open={this.state.usersList}
                            onClose={()=>this.handleDialog(false)}
                            scroll={'paper'}
                            aria-labelledby="scroll-dialog-title"
                            aria-describedby="scroll-dialog-description"
                            >
                            <DialogTitle id="scroll-dialog-title">Users in Chatroom</DialogTitle>
                            <DialogContent dividers={true}>
                            <DialogContentText
                                id="scroll-dialog-description"
                                // ref={descriptionElementRef}
                                tabIndex={-1}
                                >
                                {
                                    Object.entries(this.state.chatRoom.users).map(user=>{
                                        return (<div key={user[0]}>{user[1].userName} - {user[1].userEmail}</div>)
                                    })
                                }
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={()=>this.handleDialog(false)} color="primary">
                                close
                            </Button>
                            </DialogActions>
                        </Dialog>
                        </div>
                    </div>
                    <div className= 'view-message' onScroll = {this.handleScroll.bind(this)}>
                        {
                            this.state.messages.length?
                            this.state.messages.map((msg , index) =>{
                                return (<div className = {msg.user.userId === this.context.auth.currentUser.uid ? 'my-msg msg' : 'user-msg msg'} key = {index}>
                                            <Message message = {msg}/>
                                        </div>)
                            })
                            :null
                        }
                    </div>
                    <div className = 'send-message'>
                        <SendMessage chatRoomId = {this.state.chatRoomId}/>
                    </div>
                    </div>:
                    this.state.chatRoom?
                    <div style = {{display : 'flex' , flexDirection : 'column' , justifyContent : 'center' , alignItems : 'center' , marginTop : '40px'}}>
                        <div className = 'join-chatroom-image' style = {{backgroundImage : `url(${this.state.chatRoom.photoUrl})`}}/><br/>
                        <div className = 'join-chatroom-name'>{this.state.chatRoom.chatRoomName}</div><br/>
                        <div className = 'join-chatroom-moto'>{this.state.chatRoom.moto}</div><br/>
                        <Button color = 'primary' onClick = {()=>this.joinChatRoom(this.state.chatRoomId)}>Join Chatroom</Button>
                    </div>:<div style={{color : '#b9b9b9' , marginTop : '50px'}}>
                        Enter the URL of chatRoom to join<br/>
                        <i>eg. /chatRoom/9c9RgQ3P16eqM4pHerJpN</i><br/><br/>
                        Or can create one with the plus icon
                    </div>:
                    <div style = {{color : 'white', marginTop : '50px'}}>Sign in to join or chat</div>
                }
            </div>
        )
    }
}

ViewMessage.contextType = FirebaseContext
export default withRouter(ViewMessage)