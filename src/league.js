import Promise from 'promise-polyfill';
import localforage from 'localforage';
import { ONE_VS_ONE, ONE_VS_TWO, TWO_VS_TWO } from './constants';

const getLeague = leagueId =>
  localforage.getItem(leagueId)
  .then((leagueResults = {}) => leagueResults);

const getNewLeaguePosition = (table, team) => {
  const { teamName, points } = team;
  const currentPoints = (table[teamName] && table[teamName].points) || 0;
  return {
    team: teamName,
    points: currentPoints + points,
  };
}

const addResultToLeague = result => table => {
  return {
    ...table,
    [result.team1.teamName]: getNewLeaguePosition(table, result.team1),
    [result.team2.teamName]: getNewLeaguePosition(table, result.team2),
  };
}

export const updateLeague = result =>
  getLeague(result.matchTypeId)
  .then(addResultToLeague(result))

export const getLeagues = () =>
  Promise.all(
    getLeague(ONE_VS_ONE),
    getLeague(ONE_VS_TWO),
    getLeague(TWO_VS_TWO),
  )
  .then(([OneVsOne, OneVsTwo, TwoVsTwo]) => ({
    ONE_VS_ONE: OneVsOne,
    ONE_VS_TWO: OneVsTwo,
    TWO_VS_TWO: TwoVsTwo,
  }));
