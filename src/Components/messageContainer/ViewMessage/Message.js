import React from 'react'
import './message.css'

const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

const Message = (props) =>{
    //props => message
    const date = props.message.timeStamp.toDate()
    // console.log(date)
    const stringDate = date.toString().split(' ')
    const time = formatAMPM(date)
    return(
        <div className = 'message-container'>
            <div className = 'cont-1'><span className = 'user-name-text'>{props.message.user.userName}</span><span className = 'date-text'>{`${date.getDate()} ${stringDate[1]}`}</span></div>
            <div className = 'message-text'>{props.message.message}</div>
            <div className = 'time-text'>{time}</div>
        </div>
    )
}

export default Message