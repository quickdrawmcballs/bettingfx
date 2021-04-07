"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NbaOdds = exports.TeamBoxScores = exports.Team = void 0;
class Team {
    constructor() {
        this.city = "";
        this.team = "";
        this.full = "";
        this.league = "";
    }
}
exports.Team = Team;
class TeamBoxScores {
    constructor(team) {
        this.city = '';
        this.team = '';
        this.full = '';
        this.league = '';
        this.games = { away: [], home: [] };
        this.getAllGames = () => this.games.home.concat(this.games.away).sort((a, b) => (a.scheduled > b.scheduled) ? 1 : -1);
        this.getLastGames = (num) => {
            let all = this.getAllGames();
            return all.slice(Math.max(all.length - num, 1));
        };
        // super(team);
        this.city = team.city;
        this.team = team.team;
        this.full = team.full;
        this.league = team.league;
    }
}
exports.TeamBoxScores = TeamBoxScores;
class NbaOdds {
    constructor() {
        this.date = "";
        this.home_team = "";
        this.away_team = "";
    }
}
exports.NbaOdds = NbaOdds;
//# sourceMappingURL=teams.js.map