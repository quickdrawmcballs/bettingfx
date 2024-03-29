import { createServer } from 'http';
import { Server } from "socket.io";
import express from 'express';

import { Logger } from './logging';
import { getPlayedGames as NBASeason } from './nba/statsRetriever';
import { doOdds } from './utils/oddsEngine';
// import { getUpcomingGameStats, getUpcomingGameStatsNew } from './nba/statsEngine';
import { getTeamStats, getUpcomingGameStats } from './nba/statsService';

import { RequestError } from '../../models/lib/serverErrors';
import { getTeam } from './utils/teams';


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
            catch (error:any) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating Odds`,
                    `An Error has occurred updating Odds`,
                    error as Error
                ));
            }
        });

        socket.on('refresh-nba-season', async (refresh:boolean) => {
            Logger.info(`Running season... Refresh:${refresh}`);
            try {
                let season = await NBASeason(refresh);
                socket.emit('oddsNBA',season);
            }
            catch (error:any) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating NBA Season`,
                    `An Error has occurred updating NBA Season`,
                    error as Error
                ));
            }
        });

        socket.on('nba-upcoming-games-stats', async (refresh:boolean)=>{
            Logger.info(`Running upcoming games stats... Refresh:${refresh}`);
            try {
                let stats = await getUpcomingGameStats({refreshFromSource:refresh});
                socket.emit('UpcomingNBAGamesStats', stats);
            }
            catch (error : any) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Updating NBA Upcoming Games`,
                    `An Error has occurred updating NBA Upcoming Games`,
                    error as Error
                ));
            }
        });

        socket.on('nba-team-stats', async (team:string)=>{
            Logger.info(`Getting Team Stats for: ${team}`);
            try {
                let data = await getTeamStats({team});
                socket.emit('UpcomingNBAGamesStats', data);
            }
            catch(error : any) {
                Logger.error(error);
                socket.emit('server_error', new RequestError(
                    `Error Retrieving NBA Team Stats`,
                    `An Error has occurred Retrieving NBA Team Stats for ${team}`,
                    error as Error
                ));
            }
        });

        socket.on('error', (error:any)=>{
            Logger.error(error);
            socket.emit('server_error', new RequestError(
                `Socket.IO Error`,
                `An Error has occurred with the web sockets`,
                error
            ));
        });

        console.log(`Socket ${socket.id} has connected`);
    });

    httpServer.listen(port, () => {
        console.log(`  > Running socket on port: ${port}`);
    });
}

run();