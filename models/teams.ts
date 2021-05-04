export interface TEAM {
    city: string;
    team: string,
    full: string,
    league: string;
}

export class Team implements TEAM {
    city: string = "";
    team: string = "";
    full: string = "" ;
    league: string = "";
}

export interface TEAM_BOXSCORES extends TEAM {
    games: {
        away: any[];
        home: any[];
    };
    getAllGames() : any[];
    getLastGames(num:number) : any[];
}

export class TeamBoxScores implements TEAM_BOXSCORES {
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

    getAllGames = () => this.games.home.concat(this.games.away).sort((a, b) => (a.scheduled > b.scheduled) ? 1 : -1);
    getLastGames = (num:number) => {
        let all = this.getAllGames();
        
        return all.slice(Math.max(all.length - num, 1));
    }
}

export interface SCORE_ANALYSIS {
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

    scheduled?: string;
    id?:string;
}

export interface UPCOMING_GAME_STATS {
    date: number;
    home: string;
    away: string;
    homeSeason: GAME_TEAM_STATS;
    awaySeason: GAME_TEAM_STATS;
    homeLast9: GAME_TEAM_STATS;
    awayLast9: GAME_TEAM_STATS;
    odds_spread: string | undefined,
    odds_vig: string | undefined
}

export interface GAME_TEAM_STATS {
    team:string;
    allGames:TEAM_BOXSCORES[];
    wins:TEAM_BOXSCORES[];
    loses:TEAM_BOXSCORES[];
    downAtHalf:TEAM_BOXSCORES[];
    upAtHalfWin:TEAM_BOXSCORES[];
    downAtHalfWin:TEAM_BOXSCORES[];
    tiesAtHalfWin:TEAM_BOXSCORES[];

    hwPerc: string;
    downAtHalfWinPerc: string;

    upAtHalfResults:string;
    downAtHalfResults:string;
}

export class NbaOdds {
    id?: string;
    date: string = "";
    home_team: string = "";
    away_team: string = "";
    odds_source?: string;
    odds_last_update?: string;
    odds_spread?: string;
    odds_vig?: string;
}

export interface DISPLAY_UPCOMING_GAMES {
    date:number;
    away:string;
    aHLWPerc: string;
    aLastXUp: string;
    aLastXDo: string;
    home:string;
    hHLWPerc: string;
    hLastXUp: string;
    hLastXDo: string;
    odds:string;
}