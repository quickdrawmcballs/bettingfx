export class NBAStats {
}

export interface Team {
    city: string;
    team: string;
    full: string;
    league: string;
}
export interface TeamBoxScores extends Team {
    games: {
        away: any[];
        home: any[];
    };
    getAllGames() : any[];
    getLastGames(num:number) : any[];
}
export interface GameTeamStats {
    team:string;
    allGames:TeamBoxScores[];
    wins:TeamBoxScores[];
    loses:TeamBoxScores[];
    downAtHalf:TeamBoxScores[];
    upAtHalfWin:TeamBoxScores[];
    downAtHalfWin:TeamBoxScores[];
    tiesAtHalfWin:TeamBoxScores[];

    hwPerc: string;
    downAtHalfWinPerc: string;
}
export interface UpcomingGameStats {
    date: string;
    home: string;
    away: string;
    homeSeason: GameTeamStats;
    awaySeason: GameTeamStats;
    homeLast9: GameTeamStats;
    awayLast9: GameTeamStats;
    odds_spread: string | undefined,
    odds_vig: string | undefined
}
