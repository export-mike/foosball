import Promise from 'promise-polyfill';
import localforage from 'localforage';
import {ONE_VS_ONE, ONE_VS_TWO, TWO_VS_TWO} from './constants';

const getLeague = leagueId =>
  localforage.getItem(leagueId).then(leagueResults => !leagueResults ? {} : leagueResults);

const getNewLeaguePosition = (currentPos, newPos) => {
  const {teamName, points, goals} = newPos;
  const currentPoints = (currentPos && currentPos.points) || 0;
  const currentGoals = (currentPos  && currentPos.goals) || 0;

  return {
    team: teamName,
    points: currentPoints + points,
    goals: currentGoals + goals
  };
};

const addResultToLeague = result =>
  table => {
    const team1Name = result.team1.teamName;
    const team2Name = result.team2.teamName;
    const {
      [team1Name]: team1,
      [team2Name]: team2,
      ...rest
    } = table;

    return {
      ...rest,
      [team1Name]: getNewLeaguePosition(team1, result.team1),
      [team2Name]: getNewLeaguePosition(team2, result.team2),
    };
  };

const saveUpdatedLeague = leagueId => leagueTable =>
  localforage.setItem(leagueId, leagueTable);

export const updateLeague = result =>
  getLeague(result.matchTypeId)
  .then(addResultToLeague(result))
  .then(saveUpdatedLeague(result.matchTypeId))

export const getLeagues = () =>
  Promise.all([
    getLeague(ONE_VS_ONE),
    getLeague(ONE_VS_TWO),
    getLeague(TWO_VS_TWO)
  ]).then(([
    OneVsOne,
    OneVsTwo,
    TwoVsTwo,
  ]) => ({
    ONE_VS_ONE: OneVsOne,
    ONE_VS_TWO: OneVsTwo,
    TWO_VS_TWO: TwoVsTwo,
  }));
