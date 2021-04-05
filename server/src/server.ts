import { createServer } from 'http';
import { Server } from "socket.io";
import express from 'express';

import { Logger } from './logging';
import { doSeason as NBASeason } from './nba/statsRetreiver';
import { doOdds } from './utils/oddsEngine';
import { getUpcomingGameStats } from './nba/statsEngine';

import { RequestError } from '../../models/lib/serverErrors';

const documents:any = {};

const PORT = 8001;

async function run() {
    const port = process.env.PORT || PORT;
    const app = express();

    app.set('port', port);
    // app.use( (req, res, next) => {
    //     res.header("Access-Control-Allow-Origin", "http://localhost:4200"); //The ionic server
    //     res.header("Access-Control-Allow-Credentials", "true");
    //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    //     next();
    // });

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            // origin: "*",
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            credentials: true,
            // allowedHeaders: ['Origin, X-Requested-With, Content-Type, Accept']
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    });

    io.on('connection', (socket)=>{
        // let previousId:string;

        // const safeJoin = (currentId:string) => {
        //     socket.leave(previousId);
        //     socket.join(currentId, () => console.log(`Socket ${socket.id} joined room ${currentId}`));
        //     previousId = currentId;
        // };

        // socket.on('getDoc', (docId:string) => {
        //     safeJoin(docId);
        //     socket.emit('document', documents[docId]);
        // });

        // socket.on('addDoc', (doc:any) => {
        //     documents[doc.id] = doc;
        //     safeJoin(doc.id);
        //     io.emit('documents', Object.keys(documents));
        //     socket.emit('document', doc);
        // });

        // socket.on('editDoc', (doc:any) => {
        //     documents[doc.id] = doc;
        //     socket.to(doc.id).emit('document', doc);
        // });

        // io.emit('documents', Object.keys(documents));


        // nba 

        socket.on('refresh-nba-odds', async (refresh:boolean) => {
            Logger.info(`Running NBA odds... Refresh:${refresh}`);
            try {
                let odds = await doOdds({sport:'basketball_nba',display:'nba'},refresh);
                socket.emit('oddsNBA',odds);
            }
            catch (error) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating Odds`,
                    `An Error has occured updating Odds`,
                    error
                ));
            }
        });

        socket.on('refresh-nba-season', async (refresh:boolean) => {
            Logger.info(`Running season... Refresh:${refresh}`);
            try {
                let season = await NBASeason(refresh);
                socket.emit('oddsNBA',season);
            }
            catch (error) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating NBA Season`,
                    `An Error has occured updating NBA Season`,
                    error
                ));
            }
        });

        socket.on('nba-upcoming-games-stats', async (refresh:boolean)=>{
            Logger.info(`Running upcoming games stats... Refresh:${refresh}`);
            try {
                let stats = await getUpcomingGameStats(refresh);
                socket.emit('UpcomingNBAGamesStats', stats);
            }
            catch (error) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating NBA Upcoming Games`,
                    `An Error has occured updating NBA Upcoming Games`,
                    error
                ));
            }
        });

        socket.on('error', (error:any)=>{
            Logger.error(error);
            socket.emit('server_error', new RequestError(
                `Socket.IO Error`,
                `An Error has occured with the web sockets`,
                error
            ));
        })

        console.log(`Socket ${socket.id} has connected`);
    });

    httpServer.listen(port, () => {
        console.log(`  > Running socket on port: ${port}`);
    });
}

run();