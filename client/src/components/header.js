import React from 'react';
import googleDocsIcon from '../assets/google-docs.png';
import starIcon from '../assets/star.png';
import chatIcon from '../assets/chat.png';
import meetIcon from '../assets/meet.png';
import lockIcon from '../assets/lock.png';
import userIcon from '../assets/user.png';
import calendarIcon from '../assets/google-calendar.png';
import keepsIcon from '../assets/keeps.png';
import checkmarkIcon from '../assets/checkmark.png';
import contactsIcon from '../assets/contacts.png';
import mapsIcon from '../assets/google-maps.png';
import lineIcon from '../assets/line.png';
import plusIcon from '../assets/plus.png';
import share from '../assets/add-person.png';
import chatBot from '../assets/chat-bot.png';
import close from '../assets/close.png';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';  

export default function Header({ documentId }) { //this is the header component
  const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [showChat, setShowChat] = useState(false);

  const handleShare = async () => { //this function handles the share button
    if (navigator.share) { //if the web share api is supported
      try {
        await navigator.share({ //share the content
          title: 'Shared content title', //title of the content
          text: 'Shared content description', //description of the content
          url: `http://localhost:3000/documents/${documentId}`, //url of the content
        });
      } catch (error) { //if there is an error
        console.error('Sharing failed:', error); //log the error
      }
    } else {
      console.error('Web Share API not supported.');    //if the web share api is not supported
    }
  };
  const handleInputChange = (event) => {
    setInput(event.target.value);
};

const handleSubmit = async (event) => {
    event.preventDefault();
    const userMessage = input.trim();
    if (userMessage) {
        setInput('');

        try {
            const response = await axios.post('http://localhost:5000/generate', {
                prompt: userMessage
            });
            const aiMessage = response.data; // Adjust based on actual response format
            setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessage }, { sender: 'ai', text: aiMessage }]);
        } catch (error) {
            console.error('Error communicating with AI:', error);
            setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessage }, { sender: 'ai', text: 'Sorry, there was an error.' }]);
        }
    }
};
const handleClose = () => {
    setShowChat(false);
}

  return (
    <header className="header flex">
      <span className="icon-container">
        <img src={googleDocsIcon} alt="Icon" className="icon" /> {/*google docs icon*/}
      </span>
      <div className="title-container">
        <div className="flex">
          <h1 className="docs-title">Untitled document</h1> {/*title of the document*/}
          <img src={starIcon} alt="star" className="star" /> {/*star icon*/}
        </div>
        {/* <div className="flex options-container"> 
          <p className="options">File</p>
          <p className="options">Edit</p>
          <p className="options">View</p>
          <p className="options">Insert</p>
          <p className="options">Format</p>
          <p className="options">Tools</p>
          <p className="options">Extensions</p>
          <p className="options">Help</p>
        </div> */}
      </div>
      <div className="right-corner-bar flex"> {/*right corner bar*/}
        <div className="chat-icon-container">
          <img src={chatIcon} alt="chat" className="chat-icon" /> {/*chat icon*/}
        </div>
        <div className="meet-icon-container">
          <img src={meetIcon} alt="meet" className="meet-icon" /> {/*meet icon*/}
        </div>
        <button className="button" onClick={handleShare}>  {/*share button*/}
          <span className="people-icon">
            <img src={lockIcon} alt="lock" className="lock-icon" />
          </span>
          <span className="text-share" >Share</span>
          <span className="button-icon">
            <img src={share} alt="person" className='share-icon' />
          </span>
        </button>
        
        <div className="side-bar flex"> {/*side bar*/}
          <Link to="https://google.com">
            <img className="user-icon" src={userIcon} alt="user" />
          </Link>
          <Link to="https://calendar.google.com" >
            <img className="side-icon" src={calendarIcon} alt="calendar" />
          </Link>
          <Link to="https://keep.google.com" >
            <img className="side-icon" src={keepsIcon} alt="keeps" />
          </Link>
          <Link to="https://google.com">
            <img className="side-icon" src={checkmarkIcon} alt="checkmark" />
          </Link>
          <Link to="https://contacts.google.com">
            <img className="side-icon" src={contactsIcon} alt="contacts" />
          </Link>
          <Link to="https://maps.google.com">
            <img className="side-icon" src={mapsIcon} alt="maps" />
          </Link>
          <img className="side-icon" src={lineIcon} alt="line" style={{ opacity: 0.3 }} />
          <img className="side-icon" src={plusIcon} alt="plus" />
          <div>
          {showChat? <div id="chat-container">
                <Link onClick={handleClose}><img className="side-icon" src={close} alt= "chatBot"/></Link>
                <div id="messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message here..."
                    />
                    <button type="submit">Send</button>
                </form>
            </div>: <Link onClick={() => setShowChat(true)}><img className="side-icon" src={chatBot} alt= "chatBot"/></Link>
}
          </div>

        </div>
      </div>
    </header>
  );
}
