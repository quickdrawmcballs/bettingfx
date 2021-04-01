import _ from 'lodash';
import { mean } from 'd3';

import { doSeason } from './statsRetreiver';
import { TEAM, getTeam } from '../utils/teams';
import { formatFloat } from '../utils/utils';
import { getOdds, Game } from '../utils/oddsEngine';
import { Logger } from '../logging';

interface TEAM_BOXSCORES extends TEAM {
    games: {
        away: any[];
        home: any[];
    };
    getAllGames() : any[];
    getLastGames(num:number) : any[];
}
class TeamBoxScores implements TEAM_BOXSCORES {
    city: string = '';
    team: string = '';
    full: string = '';
    league: string = '';
    games: { away: any[]; home: any[]; } = {away:[],home:[]};

    constructor(team:TEAM) {
        // super(team);
        this.city = team.city;
        this.team = team.team;
        this.full = team.full;
        this.league = team.league;
    }

    getAllGames = () => _.sortBy(this.games.home.concat(this.games.away),'game.scheduled');
    getLastGames = (num:number) => {
        let all = this.getAllGames();
        
        return all.slice(Math.max(all.length - num, 1));
    }
}

// h_q1, h_q2, h_half, h_q3, h_q4, h_2half, h_total, a_q1, a_q2, a_half, a_q3, a_q4, a_2half, a_total, ftr
interface SCORE_ANALYSIS {
    h_team: TEAM;
    h_q1: number;
    h_q2: number;
    h_q3: number;
    h_q4: number;
    h_half: number;
    h_2half: number;
    h_OT?: number;
    h_total:number;

    a_team: TEAM;
    a_q1: number;
    a_q2: number;
    a_q3: number;
    a_q4: number;
    a_half: number;
    a_2half: number;
    a_OT?: number;
    a_total:number;

    ftr: string;
}

export async function calc(refresh?:boolean) {
    // let team_boxscores:{ [key:string]:TEAM_BOXSCORES } = {};
    let team_boxscores = new Map();
    let analysis:SCORE_ANALYSIS[] = [];

    try {
        let { json } = await doSeason(refresh);

        json.forEach( (game:any) => {
            let h_team = getTeam(game.home.name);
            let a_team = getTeam(game.away.name);

            if (game.game_stats.home.points>game.game_stats.away.points) {
                game.winner = h_team.full;
                game.loser = a_team.full;
            }
            else {
                game.winner = a_team.full;
                game.loser = h_team.full;
            }
            game.h_half = game.game_stats.home.scoring[0].points + game.game_stats.home.scoring[1].points;
            game.a_half = game.game_stats.away.scoring[0].points + game.game_stats.away.scoring[1].points;
            game.half_winner = (game.h_half === game.a_half) ? 'Tied' : (game.h_half > game.a_half) ? h_team.full : a_team.full;
            game.half_loser = (game.h_half === game.a_half) ? 'Tied' : (game.h_half > game.a_half) ? a_team.full : h_team.full;

            game.norm_home = h_team;
            game.norm_away = a_team;

            // console.log(`${game.id} - ${game.away.name} @ ${game.home.name}`);
            let home_BoxScore = <TEAM_BOXSCORES>team_boxscores.get(h_team.full);
            if (!home_BoxScore) {
                home_BoxScore = new TeamBoxScores(h_team);
                team_boxscores.set(h_team.full,home_BoxScore);
            }
            home_BoxScore.games.away.push(game);

            let away_BoxScore = <TEAM_BOXSCORES>team_boxscores.get(a_team.full);
            if (!away_BoxScore) {
                away_BoxScore = new TeamBoxScores(a_team);
                team_boxscores.set(a_team.full,away_BoxScore);
            }
            away_BoxScore.games.away.push(game);

            analysis.push({
                h_team,
                h_q1: game.game_stats.home.scoring[0].points,
                h_q2: game.game_stats.home.scoring[1].points,
                h_q3: game.game_stats.home.scoring[2].points,
                h_q4: game.game_stats.home.scoring[3].points,
                h_half: game.game_stats.home.scoring[0].points + game.game_stats.home.scoring[1].points,
                h_2half: game.game_stats.home.scoring[2].points + game.game_stats.home.scoring[3].points,
                h_total: game.game_stats.home.points,

                a_team,
                a_q1: game.game_stats.away.scoring[0].points,
                a_q2: game.game_stats.away.scoring[1].points,
                a_q3: game.game_stats.away.scoring[2].points,
                a_q4: game.game_stats.away.scoring[3].points,
                a_half: game.game_stats.away.scoring[0].points + game.game_stats.away.scoring[1].points,
                a_2half: game.game_stats.away.scoring[2].points + game.game_stats.away.scoring[3].points,
                a_total: game.game_stats.away.points,

                ftr: (game.game_stats.home.points>game.game_stats.away.points) ? 'H' : 'A'
            });
        });

        // analysis
        let homes = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H');
        let aways = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A');
        let homeNoTies = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && game.h_half !== game.a_half);
        let awayNoTies = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && game.h_half !== game.a_half);
        let allGamesNoHalfTies = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.h_half !== game.a_half);

        let home_avg_score = mean(_.map(analysis,'h_total'));
        let away_avg_score = mean(_.map(analysis,'a_total'));

        console.log(`Total number of games: ${analysis.length}`);
        console.log(`Avg home score ${ formatFloat(<number>home_avg_score)}`);
        console.log(`Avg away score ${ formatFloat(<number>away_avg_score)}`);
        console.log(`Avg total score ${ formatFloat(<number>home_avg_score + <number>away_avg_score)}`);
        console.log(`Win rate of home team ${ formatFloat(homes.length / analysis.length * 100) }`);
        console.log(`Win rate of away team ${ formatFloat(aways.length / analysis.length * 100) }`);

        let h_q1_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_q1 > game.a_q1));
        let h_q2_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_q2 > game.a_q2));
        let h_q3_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_q3 > game.a_q3));
        let h_q4_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_q4 > game.a_q4));
        let h_half_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_half > game.a_half));

        let a_q1_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q1 < game.a_q1));
        let a_q2_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q2 < game.a_q2));
        let a_q3_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q3 < game.a_q3));
        let a_q4_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q4 < game.a_q4));
        let a_half_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_half < game.a_half));

        let ties = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.h_half === game.a_half);

        // console.log(`Win rate of home 1st Quarter ${ formatFloat(h_q1_win.length / homes.length * 100) }`);
        // console.log(`Win rate of home 2nd Quarter ${ formatFloat(h_q2_win.length / homes.length * 100) }`);
        // console.log(`Win rate of home 3rd Quarter ${ formatFloat(h_q3_win.length / homes.length * 100) }`);
        // console.log(`Win rate of home 4th Quarter ${ formatFloat(h_q4_win.length / homes.length * 100) }`);
        console.log(`Win rate of home 1st Half ${ formatFloat(h_half_win.length / homeNoTies.length * 100) }`);
        // console.log(`Win rate of home 1st Half ${ formatFloat(h_half_win.length / allGamesNoHalfTies.length * 100) }`);

        // console.log(`Win rate of away 1st Quarter ${ formatFloat(a_q1_win.length / aways.length * 100) }`);
        // console.log(`Win rate of away 2nd Quarter ${ formatFloat(a_q2_win.length / aways.length * 100) }`);
        // console.log(`Win rate of away 3rd Quarter ${ formatFloat(a_q3_win.length / aways.length * 100) }`);
        // console.log(`Win rate of away 4th Quarter ${ formatFloat(a_q4_win.length / aways.length * 100) }`);
        console.log(`Win rate of away 1st Half ${ formatFloat(a_half_win.length / awayNoTies.length * 100) }`);
        // console.log(`Win rate of away 1st Half ${ formatFloat(a_half_win.length / allGamesNoHalfTies.length * 100) }`);
    
        let q1_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_q1 < game.a_q1) : (game.h_q1 > game.a_q1));
        let q2_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_q2 < game.a_q2) : (game.h_q2 > game.a_q2));
        let q3_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_q3 < game.a_q3) : (game.h_q3 > game.a_q3));
        let q4_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_q4 < game.a_q4) : (game.h_q4 > game.a_q4));
        let half_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_half < game.a_half) : (game.h_half > game.a_half));
        
        // console.log(`Win rate of 1st Quarter ${ formatFloat(q1_win.length / analysis.length * 100) }`);
        // console.log(`Win rate of 2nd Quarter ${ formatFloat(q2_win.length / analysis.length * 100) }`);
        // console.log(`Win rate of 3rd Quarter ${ formatFloat(q3_win.length / analysis.length * 100) }`);
        // console.log(`Win rate of 4th Quarter ${ formatFloat(q4_win.length / analysis.length * 100) }`);

        console.log(`Win rate of 1st Half ${ formatFloat(half_win.length / (allGamesNoHalfTies.length) * 100) }`);


        // function printHalfWins(team:string) : void {
        //     _.sortBy(buildIt[team].wins,['game.scheduled']).forEach( (game:any) => {
        //         console.log(`${game.scheduled}: ${game.away.name} H: ${game.a_half} T: ${game.away_points}\t@\t${game.home.name}: H: ${game.h_half} T: ${game.home_points}. Winner: ${game.winner}`);
        //         // (game.home.name === team) ? 
        //         //     console.log(`${game.away.name} @ ${game.home.name} : H: ${game.h_half} T: ${game.home_points}`) :
        //         //     console.log(`${game.away.name} @ ${game.home.name} : H: ${game.a_half} T: ${game.away_points}`)
        //     });
        // }
        // function printGames(team:string) : void {
        //     _.sortBy(buildIt[team].allGames,['game.scheduled']).forEach( (game:any) => {
        //         console.log(`${game.scheduled}:\t${game.away.name} H: ${game.a_half} T: ${game.away_points}\t@\t${game.home.name}: H: ${game.h_half} T: ${game.home_points}.\t\tHalfWinner: ${game.half_winner}, Winner: ${game.winner}`);
        //     });
        // }

        // print out scores of Rockets at half
        // printGames('Minnesota Timberwolves');
        console.log('----  Teams  ----');
        let allTeamsSeasonStats = getAllTeamStats(team_boxscores);
        _.sortBy(_.values(allTeamsSeasonStats),['hwPerc']).forEach( (entry:any) =>console.log(`${entry.team} (${entry.wins.length}-${entry.loses.length}): W%1H - ${entry.hwPerc}`));
        console.log('----  Last 9  ----');
        let allTeamsLastXStats = getLastTeamStats(team_boxscores,9);
        _.sortBy(_.values(allTeamsLastXStats),['hwPerc']).forEach( (entry:any) =>console.log(`${entry.team} (${entry.wins.length}-${entry.loses.length}): W%1H - ${entry.hwPerc}`));

        console.log('---- Tonite ----');

        let upcoming = await getOdds({sport:'basketball_nba',display:'nba'},false);
        upcoming.forEach((game:Game)=>{
            let home = getTeam(game.home_team);
            let away = getTeam(game.away_team);

            let homeBuilt = allTeamsSeasonStats[home.full];
            let awayBuilt = allTeamsSeasonStats[away.full];

            console.log(`${game.date}\t${away.full} (${awayBuilt.wins.length}-${awayBuilt.loses.length}): ${awayBuilt.hwPerc}\t@ ` + 
                `${home.full} (${homeBuilt.wins.length}-${homeBuilt.loses.length}): ${homeBuilt.hwPerc}\t${game.odds_spread} ${game.odds_vig}`);

        });

        console.log('-----------------');
    } 
    catch (err) {
        Logger.error(err);
    }
}

function getUpcomingGames(refresh?:boolean) {

}
function formatCSV(csv:string) : string {
    const rows = csv.split('\n');
    const header = (rows.shift()||'').replace(/"/g, '');
    rows.unshift(header);
    csv = rows.join('\n');

    return csv;
}

function getAllTeamStats(team_boxscores: Map<any,TEAM_BOXSCORES>) : any {
    let built:any = {};
    Array.from(team_boxscores.entries()).forEach( (team) => {
        built[team[0]] = formatTeamStats((<TEAM_BOXSCORES>team[1]).getAllGames(),team[0])
    });
    return built;
}
function getLastTeamStats(team_boxscores: Map<any,TEAM_BOXSCORES>,count:number) : any {
    let built:any = {};
    Array.from(team_boxscores.entries()).forEach( (team) => 
        built[team[0]] = formatTeamStats((<TEAM_BOXSCORES>team[1]).getLastGames(count),team[0])
    );
    return built;
}
function formatTeamStats(allGames:TEAM_BOXSCORES[],team:string) : any {
    let wins = _.filter(allGames,{'winner':team});
    let loses = _.filter(allGames,{'loser':team});

    let upAtHalf = _.filter(allGames,{'half_winner':team});
    let upAtHalfWin = _.filter(upAtHalf,{'winner':team});//_.filter(allGames,{'half_winner':team[0],'winner':team[0]});
    let downAtHalf = _.filter(allGames,{'half_loser':team});
    let downAtHalfWin = _.filter(downAtHalf,{'winner':team});
    let tiesAtHalf = _.filter(allGames,{'half_winner':'Tied'});
    let tiesAtHalfWin = _.filter(tiesAtHalf,{'winner':team});

    return {
        team,
        allGames,
        wins,
        loses,
        downAtHalf,
        upAtHalfWin,
        downAtHalfWin,
        tiesAtHalfWin,

        hwPerc: parseFloat(formatFloat(upAtHalf.length===0 ? 0 : (upAtHalfWin.length / upAtHalf.length * 100))).toFixed(2)+'%'
    };
}