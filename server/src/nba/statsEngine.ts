import _ from 'lodash';
import { mean } from 'd3';
import moment from 'moment';
import * as dfd from 'danfojs-node';

import { TEAM_BOXSCORES, TeamBoxScores, SCORE_ANALYSIS, UPCOMING_GAME_STATS, 
    GAME_TEAM_STATS, 
    DISPLAY_UPCOMING_GAMES} from '../../../models/lib/teams';

import { getPlayedGames, getRemainingGames } from './statsRetreiver';
import { getTeam } from '../utils/teams';
import { formatFloat } from '../utils/utils';
import { getOdds, Game } from '../utils/oddsEngine';
import { Logger } from '../logging';

const team_boxscores = new Map();
let analysis:SCORE_ANALYSIS[] = [];
let upcomingGames:Game[] = [];
let remainingGames:any = {};

async function updateBoxscores(refresh?: boolean) {
    team_boxscores.clear();

    let { json } = await getPlayedGames(refresh);

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
}

async function updateUpcomingGames(refresh?:boolean) {
    upcomingGames = await getOdds({sport:'basketball_nba',display:'nba'},refresh);
}

async function updateRemainingGames(refresh?:boolean) {
    remainingGames = await getRemainingGames(refresh);
}

export async function getUpcomingGameStats(refresh:boolean=false) : Promise<UPCOMING_GAME_STATS[]> {

    await Promise.all([updateBoxscores(refresh), updateUpcomingGames(refresh), updateRemainingGames(refresh)]);

    const allTeamsSeasonStats = getAllTeamStats(team_boxscores);
    const lastXSeasonStats = getLastTeamStats(team_boxscores,9);

    const upcoming = upcomingGames.map((game:Game)=>{
        const home = getTeam(game.home_team);
        const away = getTeam(game.away_team);

        const homeSeason = allTeamsSeasonStats[home.full];
        const awaySeason = allTeamsSeasonStats[away.full];
        
        const homeLastNine = lastXSeasonStats[home.full];
        const awayLastNine = lastXSeasonStats[away.full];

        console.log(`${game.date}\t${away.full} (${awaySeason.wins.length}-${awaySeason.loses.length}): ${awaySeason.hwPerc}, ${awayLastNine.downAtHalfWinPerc}\t@ ` + 
            `${home.full} (${homeSeason.wins.length}-${homeSeason.loses.length}): ${homeSeason.hwPerc}, ${homeLastNine.downAtHalfWinPerc}\t${game.odds_spread} ${game.odds_vig}`);

        return {
            date: game.date,
            home:home.full,
            away:away.full,
            homeSeason,
            awaySeason,
            homeLast9:lastXSeasonStats[home.full],
            awayLast9:lastXSeasonStats[away.full],
            odds_spread:game.odds_spread,
            odds_vig: game.odds_vig
        }
    });
    
    return upcoming;
}
export async function getUpcomingGameStatsNew(refresh:boolean=false) : Promise<DISPLAY_UPCOMING_GAMES[]> {

    await Promise.all([updateBoxscores(refresh), updateUpcomingGames(refresh)]);

    const allTeamsSeasonStats = getAllTeamStats(team_boxscores);
    const lastXSeasonStats = getLastTeamStats(team_boxscores,9);

    const upcoming = upcomingGames.map((game:Game)=>{
        const home = getTeam(game.home_team);
        const away = getTeam(game.away_team);

        const homeSeason = allTeamsSeasonStats[home.full];
        const awaySeason = allTeamsSeasonStats[away.full];
        
        const homeLastNine = lastXSeasonStats[home.full];
        const awayLastNine = lastXSeasonStats[away.full];

        // console.log(`${game.date}\t${away.full} (${awaySeason.wins.length}-${awaySeason.loses.length}): ${awaySeason.hwPerc}, ${awayLastNine.downAtHalfWinPerc}\t@ ` + 
        //     `${home.full} (${homeSeason.wins.length}-${homeSeason.loses.length}): ${homeSeason.hwPerc}, ${homeLastNine.downAtHalfWinPerc}\t${game.odds_spread} ${game.odds_vig}`);

        return {
            // date: moment(game.date).format('h:mm'),
            date: moment(game.date).valueOf(),

            away: `${away.full} (${awaySeason.wins.length}-${awaySeason.loses.length})`,
            aHLWPerc: `${awaySeason.hwPerc}`,
            aLastXUp: awayLastNine.upAtHalfResults,
            aLastXDo: awayLastNine.downAtHalfResults,
            
            home: `${home.full} (${homeSeason.wins.length}-${homeSeason.loses.length})`,
            hHLWPerc: `${homeSeason.hwPerc}`,
            hLastXUp: homeLastNine.upAtHalfResults,
            hLastXDo: homeLastNine.downAtHalfResults,
            odds: `${game.odds_spread} (${game.odds_vig})`
        } as DISPLAY_UPCOMING_GAMES;
    });

    console.table(upcoming);
    
    return upcoming;
}

export async function getTeamStats(team:string,upcomingGames?:UPCOMING_GAME_STATS[]) : Promise<any> {
    // if no upcoming games, grab them
    if (!upcomingGames) {
        upcomingGames = await getUpcomingGameStats();
    }

    let found:{team?:string,last9?:GAME_TEAM_STATS,season?:GAME_TEAM_STATS} = {};

    // find the team
    _.find(upcomingGames,(game:UPCOMING_GAME_STATS)=>{
        if (game.away === team) {
            found.team = game.away;
            found.last9 = game.awayLast9;
            found.season = game.awaySeason;
            return true;
        }
        else if(game.home === team) {
            found.team = game.home;
            found.last9 = game.homeLast9;
            found.season = game.homeSeason;
            return true;
        }
    });

    // disect the stats
    // found.last9
    let last9Win = new dfd.DataFrame(found.last9?.upAtHalfWin.map( (game:any)=> { 
        return [Math.abs(game.h_half - game.a_half),1]
    }),{columns:['diff','count']});
    let seasonWin = new dfd.DataFrame(found.season?.upAtHalfWin.map( (game:any)=> { 
        return [Math.abs(game.h_half - game.a_half),1]
    }),{columns:['diff','count']});

    return {
        team,
        last9Win: last9Win.groupby(['diff']).agg({'count':'count'}).data.map( (scoreDiff:any[])=>( {score:scoreDiff[0],count:scoreDiff[1]}) ),
        seasonWin: seasonWin.groupby(['diff']).agg({'count':'count'}).data.map( (scoreDiff:any[])=>( {score:scoreDiff[0],count:scoreDiff[1]}) )
    }
}

export async function getChartingGamStats({team, homeOrAway, lastX}:{team:string,homeOrAway?:string,lastX?:number}) {
    let _team = getTeam(team);

    let teamGames = _.filter(analysis,(game:SCORE_ANALYSIS)=> {
        if ('home' === homeOrAway) return game.h_team.full === _team.full;
        else if ('away' === homeOrAway) return game.a_team.full === _team.full;
        else return (game.h_team.full === _team.full) || (game.a_team.full === _team.full)
    });
    if (lastX) {
        teamGames = _.takeRight(teamGames,lastX)
    }    

    let allGamesNoHalfTies = _.filter(teamGames,(game:SCORE_ANALYSIS)=> game.h_half !== game.a_half);
    let half_win = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ?  (game.a_team.full === _team.full && game.h_half < game.a_half) : 
        (game.h_team.full === _team.full && game.h_half > game.a_half));
    let half_lose = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? ((game.a_team.full === _team.full) && game.h_half > game.a_half) : 
        (game.h_team.full === _team.full && game.h_half < game.a_half));
    
    return {
        team,
        homeOrAway,
        lastX,
        half_win_pd: getPointDifferiential(half_win),
        half_lose_pd: getPointDifferiential(half_lose)
    }
}

export async function calc(refresh?:boolean) {
    // let team_boxscores:{ [key:string]:TEAM_BOXSCORES } = {};
    let team_boxscores = new Map();
    analysis = [];

    try {
        let { json } = await getPlayedGames(refresh);

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

                ftr: (game.game_stats.home.points>game.game_stats.away.points) ? 'H' : 'A',
                scheduled: game.scheduled
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
        let h_half_win = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'H' && (game.h_half > game.a_half));

        let a_q1_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q1 < game.a_q1));
        let a_q2_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q2 < game.a_q2));
        let a_q3_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q3 < game.a_q3));
        let a_q4_win = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_q4 < game.a_q4));
        let a_half_win = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'A' && (game.h_half < game.a_half));

        // let ties = _.filter(analysis,(game:SCORE_ANALYSIS)=> game.h_half === game.a_half);

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
        let half_win = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_half < game.a_half) : (game.h_half > game.a_half));
        let half_lose = _.filter(allGamesNoHalfTies,(game:SCORE_ANALYSIS)=> game.ftr === 'A' ? (game.h_half > game.a_half) : (game.h_half < game.a_half));
        
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
        let consTable = upcoming.map((game:Game)=>{
            let home = getTeam(game.home_team);
            let away = getTeam(game.away_team);

            let homeBuilt = allTeamsSeasonStats[home.full];
            let awayBuilt = allTeamsSeasonStats[away.full];
            let homeLast9Built = allTeamsLastXStats[home.full];
            let awayLast9Built = allTeamsLastXStats[away.full];

            return {
                date: moment(game.date).format('LT'),
                away: `${away.full} (${awayBuilt.wins.length}-${awayBuilt.loses.length}): ${awayBuilt.hwPerc}, ${awayLast9Built.upAtHalfResults}, ${awayLast9Built.downAtHalfResults}`,
                home: `${home.full} (${homeBuilt.wins.length}-${homeBuilt.loses.length}): ${homeBuilt.hwPerc}, ${homeLast9Built.upAtHalfResults}, ${homeLast9Built.downAtHalfResults}`,
                odds: `${game.odds_spread} ${game.odds_vig}`
            }

            // return {
            //     date: game.date,
            //     away: away.full,
            //     awayRecord: `(${awayBuilt.wins.length}-${awayBuilt.loses.length})`,
            //     'awayH%W': awayBuilt.hwPerc,
            //     awayLast9W: awayLast9Built.upAtHalfResults,
            //     awayLast9C: awayLast9Built.downAtHalfResults,
            //     home: home.full,
            //     homeRecord: `(${homeBuilt.wins.length}-${homeBuilt.loses.length})`,
            //     'homeH%W': homeBuilt.hwPerc,
            //     homeLast9W: homeLast9Built.upAtHalfResults,
            //     homeLast9C: homeLast9Built.downAtHalfResults,
            //     odds: game.odds_spread
            // }

            // console.log(`${game.date}\t${away.full} (${awayBuilt.wins.length}-${awayBuilt.loses.length}): ${awayBuilt.hwPerc}, ${awayLast9Built.upAtHalfResults}, ${awayLast9Built.downAtHalfResults}\t@ ` + 
            //     `${home.full} (${homeBuilt.wins.length}-${homeBuilt.loses.length}): ${homeBuilt.hwPerc}, ${homeLast9Built.upAtHalfResults}, ${homeLast9Built.downAtHalfResults}\t${game.odds_spread} ${game.odds_vig}`);

        });
        console.table(consTable);

        // console.log('-----------------');

        // let pd_analysis = getPointDifferiential(half_lose);
        // let csv:string = convertToCsv(pd_analysis,{fields:[
        //     { label: 'Winner', value:'winner'},
        //     { label: 'Loser', value:'loser'},
        //     { label: 'Half Winner', value:'half_winner'},
        //     { label: 'Half Loser', value:'half_loser'},
        //     { label: 'Half Diff', value:'half_diff'},
        //     { label: 'Full Diff', value:'ftr_diff'}
        // ]});

        // if (csv!=='') {
        //     Logger.debug(`Creating csv file from odds diff`);
        //     // create the odds file
        //     await outputToFile(createDatedFileName(`diffs.csv`),csv);
        // }
        // console.log('-----------------');

        // let getIt = await getChartingGamStats({team:'Lakers',lastX:9});

        console.log('-----------------');

    } 
    catch (err) {
        Logger.error(err);
    }
}

function getPointDifferiential(gameStats:SCORE_ANALYSIS[]) : any[]{

    let retVal = _.map(gameStats,(game:SCORE_ANALYSIS)=>{
        let winner:string;
        let loser: string;
        let half_winner:string;
        let half_loser:string;

        if (game.ftr === 'H') {
            winner = game.h_team.full;
            loser = game.a_team.full;
        }
        else {
            winner = game.a_team.full;
            loser = game.h_team.full;
        }
        if (game.h_half > game.a_half) {
            half_winner = game.h_team.full;
            half_loser = game.a_team.full;
        }
        else {
            half_winner = game.a_team.full;
            half_loser = game.h_team.full;
        }

        // differentials
        let half_diff = Math.abs(game.h_half-game.a_half);
        let ftr_diff = Math.abs(game.h_total-game.a_total);

        return _.merge(game, {
           winner,
           loser,
           half_winner,
           half_loser,
           half_diff,
           ftr_diff 
        });
    })

    return retVal;
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

function getAllTeamStats(team_boxscores: Map<any,TEAM_BOXSCORES>) : {[key: string]: GAME_TEAM_STATS;} {
    let built:any = {};
    Array.from(team_boxscores.entries()).forEach( (team) => {
        built[team[0]] = formatTeamStats((<TEAM_BOXSCORES>team[1]).getAllGames(),team[0])
    });
    return built;
}
function getLastTeamStats(team_boxscores: Map<any,TEAM_BOXSCORES>,count:number) : {[key: string]: GAME_TEAM_STATS;} {
    let built:any = {};
    Array.from(team_boxscores.entries()).forEach( (team) => 
        built[team[0]] = formatTeamStats((<TEAM_BOXSCORES>team[1]).getLastGames(count),team[0])
    );
    return built;
}
function formatTeamStats(allGames:TEAM_BOXSCORES[],team:string) : GAME_TEAM_STATS {
    let wins = <TEAM_BOXSCORES[]> _.filter(allGames,{'winner':team});
    let loses = <TEAM_BOXSCORES[]> _.filter(allGames,{'loser':team});

    let upAtHalf = <TEAM_BOXSCORES[]> _.filter(allGames,{'half_winner':team});
    let upAtHalfWin = <TEAM_BOXSCORES[]> _.filter(upAtHalf,{'winner':team});//_.filter(allGames,{'half_winner':team[0],'winner':team[0]});
    let downAtHalf = <TEAM_BOXSCORES[]> _.filter(allGames,{'half_loser':team});
    let downAtHalfWin = <TEAM_BOXSCORES[]> _.filter(downAtHalf,{'winner':team});
    let tiesAtHalf = <TEAM_BOXSCORES[]> _.filter(allGames,{'half_winner':'Tied'});
    let tiesAtHalfWin = <TEAM_BOXSCORES[]> _.filter(tiesAtHalf,{'winner':team});

    return {
        team,
        allGames,
        wins,
        loses,
        downAtHalf,
        upAtHalfWin,
        downAtHalfWin,
        tiesAtHalfWin,

        hwPerc: upAtHalf.length===0 ? '-1' : parseFloat(formatFloat((upAtHalfWin.length / upAtHalf.length * 100))).toFixed(2),
        downAtHalfWinPerc: downAtHalf.length===0 ? '-1' : parseFloat(formatFloat((downAtHalfWin.length / downAtHalf.length * 100))).toFixed(2),

        upAtHalfResults: `${upAtHalfWin.length}-${upAtHalf.length-upAtHalfWin.length}`,
        downAtHalfResults: `${downAtHalfWin.length}-${downAtHalf.length-downAtHalfWin.length}`
    };
}

function getScoresDiffAgg(scores:TEAM_BOXSCORES[],filter:Function) : any[]{

    let df = new dfd.DataFrame(scores.map( (game:any)=> { 
        return filter(game);
    }),{columns:['diff','count']});
    let grp = df.groupby(['diff']);
    let agged = grp.agg({'count':'count'});

    return [];
}