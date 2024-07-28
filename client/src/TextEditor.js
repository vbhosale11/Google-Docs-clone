import {useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import "quill/dist/quill.snow.css";
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import Header from './components/header';


const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike"],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "video"],
    ["blockquote", "code-block", "link", "formula"],
    ["clean"]
]

export default function TextEditor() {
    const { id: documentId } = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    
    const wrapperRef = useRef(null);

    useEffect(() => {
        const s = io("http://localhost:5000");
        setSocket(s);
        console.log("connected to the server");
        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return;
            socket.emit("send-changes", delta);
        };
        quill.on("text-change", handler);
        console.log("text change");
        return () => {
            quill.off("text-change", handler);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents());
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        socket.once("load-document", document => {
            console.log(document);
            quill.setContents(document);
            quill.enable();
        });

        socket.emit("get-document", documentId);
        console.log("load document");
    }, [socket, quill, documentId]);

    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = delta => {
            quill.updateContents(delta);
        };
        socket.on("receive-changes", handler);

        return () => {
            socket.off("receive-changes", handler);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (wrapperRef.current == null) return;

        wrapperRef.current.innerHTML = "";
        const editor = document.createElement("div");
        wrapperRef.current.append(editor);
        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
        q.disable();
        q.setText("Loading...");
        setQuill(q);
    }, []);

    

    return (
        <div>
            <Header documentId={documentId} />
            <div id="container" ref={wrapperRef}></div>
            
        </div>
    );
}
