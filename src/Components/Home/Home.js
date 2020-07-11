import React ,{Component} from 'react'
import ChatRooms from '../connections/ChatRooms/ChatRooms'
import { FirebaseContext } from '../API/firebase'
import ViewMessage from '../messageContainer/ViewMessage/ViewMessage'
import CreateNewRoom from '../CreateNewRoom/CreateNewRoom'
import {Switch , Route} from 'react-router-dom'
import './home.css'

class Home extends Component{
    constructor(){
        super()
        this.state = {
            user : null,
            currentChatRoomId : null,
        }
    }


    componentDidMount(){
        // this.unsubscribeAuth = this.context.auth.onAuthStateChanged(usr=>{
        //     if(usr) this.setState({user : usr})
        //     else this.setState({user : null})
        // })
    }

    componentWillUnmount(){
        // this.unsubscribeAuth();
    }

    getCurrentChatroom(id){
        if(typeof id !== 'undefined') this.setState({currentChatRoomId : id.trim()})
        else this.setState({currentChatRoomId : null})
    }

    render(){
        return(
            <div className = 'home-container'>
                <div className = 'left-bar-chatrooms'>
                    <ChatRooms getcurrentroom = {this.getCurrentChatroom.bind(this)}/>
                </div>
                <div className = 'main-right-message-container'>
                <Switch>
                <Route exact path = '/' component = {()=><div style={{color : 'grey' , marginTop : '50px'}}>Create a Room or Join one</div>}/>
                <Route path = '/chatRoom/' component = {()=>(<ViewMessage chatRoomId = {this.state.currentChatRoomId}/>)}/>
                <Route path = '/createRoom' component = {CreateNewRoom}/>
                </Switch>
                </div>
            </div>
        )
    }
    
}

Home.contextType = FirebaseContext
export default Home