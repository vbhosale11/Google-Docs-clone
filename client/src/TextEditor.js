import { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import {io} from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }], //header is an array of objects
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor() {

    const {id: documentId} = useParams(); //extracting the id from the url
    const [socket, setSocket]= useState();
    const [quill, setQuill]= useState();

    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s);

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if(socket==null || quill==null) return

        const handler=(delta, oldDelta, source)=> {
            if(source!=="user") return //if the change is not made by the user then return
            socket.emit("send-changes", delta) //if the change is made by the user then emit the changes 
        }
        quill.on("text-change", handler)  

        return ()=> {
            quill.off("text-change", handler) //clean up function
        }
    }, [socket, quill]) //if socket or quill changes then run this useEffect

    useEffect(() => {
        if(socket==null || quill==null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents()) 
        }, SAVE_INTERVAL_MS)

        return ()=> {
            clearInterval(interval)
        }
    } , [socket, quill])

    useEffect(() => {
        if(socket==null ||quill==null) return
        
        socket.once("load-document", document => { //when we receive the document from the server
            quill.setContents(document) //set the contents of the quill editor
            quill.enable() //enable the quill editor
        })
        socket.emit ("get-document", documentId) //emit the document id to the server
    }, [socket, quill, documentId])


    useEffect(() => {
        if(socket==null || quill==null) return

        const handler = delta => {
            quill.updateContents(delta) //update the contents of the quill editor
        } 
        socket.on("receive-changes", handler) //when we receive the changes from the server

        return ()=> {
            socket.off("receive-changes", handler) 
        }
    }, [socket, quill])

    const wrapperRef = useCallback(wrapper => {
        if(wrapper == null) return //if wrapper is null then return

        wrapper.innerHTML = "" //if wrapper is not null then clear the wrapper
        const editor = document.createElement("div") //creating a div element
        wrapper.append(editor) //appending the div element to the wrapperRef
        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } }) //currently the editor is not inside our main conatiner so it will run evry tym we make any change to the code//multiple instances of quill will be created soo use useRef hook
        q.disable() //disable the quill editor
        q.setText("Loading...")
        setQuill(q)
    }, []) // empty array means only run this once
    return <div id="container" ref={wrapperRef}></div>

}
