import React, { Component } from 'react'
import './chatroom.css'
import { FirebaseContext } from '../../../API/firebase'
import {Link} from 'react-router-dom'

class ChatRoom extends Component{
    constructor(props){
        super(props)
        //props=> getcurrentroom func
        this.state = {
            lastSeen : null,
            newMessage : false,
            lastDocTimeStamp : null,
        }
        this.updateNotify = this.updateNotify.bind(this)
    }
    
    getMessagesSnap(){
        this.unsubscribeMsg = this.context.db.collection('ChatRooms').doc(this.props.id.trim()).collection('Messages').orderBy('timeStamp' , 'desc').limit(1).onSnapshot(snap=>{
            snap.forEach(doc=>{
                // console.log(doc.data().timeStamp)
                this.setState({lastDocTimeStamp : doc.data().timeStamp} , this.updateNotify)
                // console.log(this.state.lastSeen)
                // if(doc.data().timeStamp > this.state.lastSeen) this.setState({newMessage : true})
                // else if(doc.data().timeStamp === this.state.lastSeen) this.setState({newMessage : false})
            })
            // console.log(this.props.name)
        })
    }

    getLastSeenSnap(){
        this.unsubscribeLastSeen = this.context.db.collection('Users').doc(this.props.User.uid)
        .collection('LastSeenMessages').doc(this.props.id.trim()).onSnapshot(snap=>{
            this.setState({lastSeen : snap.data().lastSeen} , this.updateNotify)
        })
    }

    updateNotify(){
        if(this.state.lastDocTimeStamp && this.state.lastSeen && (this.state.lastDocTimeStamp.valueOf() > this.state.lastSeen.valueOf())){ 
            this.setState({newMessage : true} , this.props.changePosition)
        }
        else this.setState({newMessage : false})
    }

    componentDidMount(){
        this.getLastSeenSnap()
        this.getMessagesSnap()
    }

    componentWillUnmount(){
        this.unsubscribeMsg()
        this.unsubscribeLastSeen()
    }

    componentWillUpdate(){

    }

    render(){
        
        return(
            <div className = 'noselect'>
            <Link to = {'/chatRoom/'+ this.props.id.trim()}><div className = 'chatroom-minimap'>
                <div className = 'chatroom-image' style = {{backgroundImage : `url(${this.props.chatroom.photoUrl})`}}>
                    <div className = 'new-message-dot' style = {{height : this.state.newMessage ? '10px' : '0' , boxShadow: this.state.newMessage ?'0 0 20px 2px #3751e6' :'none'}}/>
                </div>
                <div className = 'chatroom-name'>{this.props.chatroom.name}</div>
            </div></Link>
            </div>
        )
    }
}

ChatRoom.contextType = FirebaseContext
export default ChatRoom