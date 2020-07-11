import React , {Component} from 'react'
import {FirebaseContext} from '../../API/firebase/'
import ChatRoom from './ChatRoom/ChatRoom'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {Link} from 'react-router-dom'
import './chatrooms.css'

class ChatRooms extends Component{
    constructor(props){
        super(props)
        //props => currentroom func
        this.state = {
            user : null,
            chatRooms : {},
            chatRoomsArray : [],
        }
        this.updatePosition = this.updatePosition.bind(this)
    }

    // createNewGroup(){
    //     this.context.db.collection('ChatRooms').doc().set
    // }

    getChatRooms(user){
        this.context.db.collection('Users').doc(user.uid).onSnapshot(snap=>{
            if(typeof snap !== 'undefined')
            this.setState({chatRooms : snap.data().chatRooms} , this.convertMapToArray.bind(this))
        })
    }

    convertMapToArray(){
        let arr = Object.entries(this.state.chatRooms)
        this.setState({chatRoomsArray : arr})
    }

    updatePosition(index){
        let room = this.state.chatRoomsArray[index]
        this.setState(prevState => {
            let chatroom = prevState.chatRoomsArray
            chatroom.splice(index , 1)
            chatroom.unshift(room)
            return({
                chatRoomsArray : chatroom
            }
            )
        })
    }

    componentDidMount(){
        this.getChatRooms(this.context.auth.currentUser)
    }

    render(){
        return(
            <div className = 'chatrooms-map'>
                    <Link to='/CreateRoom' className = 'noselect'><AddCircleOutlineIcon color = 'primary' style = {{fontSize : '50px'}}/></Link>
                    {
                        this.state.chatRoomsArray.length!=0?
                        this.state.chatRoomsArray.map((value , index)=>{
                            return <ChatRoom key = {value[0]} chatroom = {value[1]} id = {value[0]} getcurrentroom = {this.props.getcurrentroom} User = {this.context.auth.currentUser ? this.context.auth.currentUser : null} changePosition = {() => this.updatePosition(index)}/>
                        }):null
                    }
            </div>
        )
    }
}


ChatRooms.contextType = FirebaseContext
export default ChatRooms