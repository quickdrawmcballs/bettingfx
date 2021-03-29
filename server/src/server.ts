import http from 'http';
import express from 'express';

const documents:any = {};

const PORT = 8001;

async function run() {
    const port = process.env.PORT || PORT;
    // const server = createServer();
    // const io = socketio(server);
    const app = express();
    app.set('port', port);

    let io = require('socket.io')(http);

    io.on('connection', (socket:any)=>{
        let previousId:string;

        const safeJoin = (currentId:string) => {
            socket.leave(previousId);
            socket.join(currentId, () => console.log(`Socket ${socket.id} joined room ${currentId}`));
            previousId = currentId;
        };

        socket.on('getDoc', (docId:string) => {
            safeJoin(docId);
            socket.emit('document', documents[docId]);
        });

        socket.on('addDoc', (doc:any) => {
            documents[doc.id] = doc;
            safeJoin(doc.id);
            io.emit('documents', Object.keys(documents));
            socket.emit('document', doc);
        });

        socket.on('editDoc', (doc:any) => {
            documents[doc.id] = doc;
            socket.to(doc.id).emit('document', doc);
        });

        io.emit('documents', Object.keys(documents));

        console.log(`Socket ${socket.id} has connected`);
    });

    http
        .createServer(app)
        .listen(port, () => {
            console.log(`  > Running socket on port: ${port}`);
        }
    );
}

run();