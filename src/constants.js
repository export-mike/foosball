export const TEAM1 = 'team1';
export const DRAW = 'DRAW';
export const TEAM2 = 'team2';
export const ONE_VS_ONE = '1vs1';
export const ONE_VS_TWO = '1vs2';
export const TWO_VS_TWO = '2vs2';
export const matchTypes = {
  [ONE_VS_ONE]: {
    ONE_VS_ONE,
    team1: 1,
    team2: 1,
  },
  [ONE_VS_TWO]: {
    ONE_VS_TWO,
    team1: 1,
    team2: 2,
  },
  [TWO_VS_TWO]: {
    TWO_VS_TWO,
    team1: 2,
    team2: 2,
  },
};
