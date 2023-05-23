const mongoose= require("mongoose"); //importing mongoose
const Document = require("./Document"); //importing the Document model

mongoose.connect('mongodb://localhost/docs',{ //connecting to the database
    useNewUrlParser:true, 
    useUnifiedTopology:true, 
})
const defaultValue = ""  //default value of the document

const io=require('socket.io')(3001, {    //creating the socket
    cors: {                              //configuring the socket
        origin: "http://localhost:3000",  //origin of the socket
        methods: ["GET", "POST"]          //methods of the socket
    },
})

io.on("connection", socket=> {            //when the socket is connected
    socket.on("get-document", async documentId => {             //when we receive the document id from the client
        const document = await findOrCreateDocument(documentId) //find or create the document
        socket.join(documentId)                               //join the document
        socket.emit("load-document", document.data)        //emit the document data to the client

        socket.on("send-changes", delta => { //when we receive the changes from the client
        socket.broadcast.to(documentId).emit("receive-changes", delta) //broadcasting the changes to all the clients except the one who made the changes
        })
        socket.on("save-document", async data => {    //when we receive the document data from the client
            await Document.findByIdAndUpdate(documentId, {data}) //update the document data
        })
    })
})

async function findOrCreateDocument(id, defaultValue) {  //this function finds or creates the document
  if (id == null) return;                            //if the id is null then return

  const document = await Document.findById(id);   //find the document by id
  if (document) return document;               //if the document exists then return the document
  return await Document.create({ _id: id, data: defaultValue });      //if the document does not exist then create the document
}
  