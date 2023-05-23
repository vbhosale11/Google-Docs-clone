import { useCallback, useEffect, useState } from 'react';
import Quill from 'quill'; //importing quill
import "quill/dist/quill.snow.css"; //importing quill snow css
import {io} from 'socket.io-client';  //importing socket.io-client for real time collaboration
import { useParams } from 'react-router-dom';
import Header from './components/header';

const SAVE_INTERVAL_MS = 2000; //this is the save interval in milliseconds

const TOOLBAR_OPTIONS = [  //this is the toolbar options
    [{ header: [1, 2, 3, 4, 5, 6, false] }], //header is an array of objects
    [{ font: [] }], //font is an array of objects
    [{ list: "ordered" }, { list: "bullet" }], 
    ["bold", "italic", "underline", "strikethrough"], //bold, italic, underline, strikethrough are array of objects
    [{indent: "-1"}, {indent: "+1"}], 
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }], 
    ["image", "video"],
    [ "blockquote", "code-block", "link", "formula"],
    ["clean"]
]

export default function TextEditor() { //this is the text editor component

    const {id: documentId} = useParams(); //extracting the id from the url
    const [socket, setSocket]= useState(); //initializing the socket
    const [quill, setQuill]= useState();  //initializing the quill editor

    useEffect(() => {
        const s = io("https://google-doc-server.onrender.com")  //connecting to the server
        setSocket(s);  //setting the socket

        return () => {
            s.disconnect() //disconnecting the socket
        }
    }, []) //empty array means only run this once

    useEffect(() => {
        if(socket==null || quill==null) return  //if socket or quill is null then return

        const handler=(delta, oldDelta, source)=> {
            if(source!=="user") return //if the change is not made by the user then return
            socket.emit("send-changes", delta) //if the change is made by the user then emit the changes 
        }
        quill.on("text-change", handler) //when the text changes in the quill editor  

        return ()=> {
            quill.off("text-change", handler) //clean up function
        }
    }, [socket, quill]) //if socket or quill changes then run this useEffect

    useEffect(() => {
        if(socket==null || quill==null) return //if socket or quill is null then return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())  //emit the contents of the quill editor
        }, SAVE_INTERVAL_MS) //save the document after every SAVE_INTERVAL_MS milliseconds

        return ()=> {
            clearInterval(interval) //clean up function
        }
    } , [socket, quill]) //if socket or quill changes then run this useEffect

    useEffect(() => {
        if(socket==null ||quill==null) return
        
        socket.once("load-document", document => {  //when we receive the document from the server
            quill.setContents(document)  //set the contents of the quill editor
            quill.enable()  //enable the quill editor
        })
        socket.emit ("get-document", documentId) //emit the document id to the server
    }, [socket, quill, documentId])  //if socket or quill or documentId changes then run this useEffect


    useEffect(() => {
        if(socket==null || quill==null) return

        const handler = delta => {
            quill.updateContents(delta) //update the contents of the quill editor
        } 
        socket.on("receive-changes", handler) //when we receive the changes from the server

        return ()=> {
            socket.off("receive-changes", handler)  //clean up function
        }
    }, [socket, quill]) //if socket or quill changes then run this useEffect

    const wrapperRef = useCallback(wrapper => { //useCallback is used to prevent the function from being created again and again
        if(wrapper == null) return  //if wrapper is null then return

        wrapper.innerHTML = ""  //if wrapper is not null then clear the wrapper
        const editor = document.createElement("div") //creating a div element
        wrapper.append(editor) //appending the div element to the wrapperRef
        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } }) //currently the editor is not inside our main conatiner so it will run evry tym we make any change to the code//multiple instances of quill will be created soo use useRef hook
        q.disable() //disable the quill editor
        q.setText("Loading...") //set the text of the quill editor to loading
        setQuill(q) //set the quill editor
    }, []) // empty array means only run this once
    return (<div>
        <Header documentId={documentId}/>  {/*this is the header component*/}
        <div id="container" ref={wrapperRef}> {/*this is the main container*/}
        </div>
    </div>
    );

}
