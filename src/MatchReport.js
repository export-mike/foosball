import React, { Component } from 'react';
import {TEAM1, DRAW, TEAM2, ONE_VS_ONE, matchTypes} from './constants';
import {updateLeague, getLeagues} from './league';
import withHandlers from 'recompose/withHandlers';
import styled from 'styled-components';

let MatchType = props => (
  <MatchTypeWrapper>
    <Label onChange={props.onChange}>{props.name}</Label>
    <Checkbox name={props.name} checked={props.checked} onChange={props.onChange} />
  </MatchTypeWrapper>
);

MatchType = withHandlers({
  onChange: props =>
    e => {
      props.onChange(props.name);
    },
})(MatchType);

const MatchTypeWrapper = styled.div`
  margin-right: 0.2em;
`;

const Label = styled.label`
  font-size: 1.2em;
  margin-right: 0.2em;
`;

const Checkbox = props => <Input type="checkbox" {...props} />;

const Input = styled.input`
  padding: 2em;
`;
const Report = styled.div`
  padding: 2em;
`;
const MatchTypes = styled.div`
  display: flex;
`;
const Button = styled.button`
  display: flex;
`;

let TextInput = props => <Input {...props} value={props.value} />;
TextInput = withHandlers({
  onChange: props => e => props.onChange(e.target.value),
})(TextInput);

const SAVE_TIMEOUT = 5000;

const initialState = {
  matchType: matchTypes[ONE_VS_ONE],
  matchTypeId: ONE_VS_ONE,
  team1: {0: '', 1: '', goals: '', teamName: ''},
  team2: {0: '', 1: '', goals: '', teamName: ''},
  saved: false,
  error: false,
  score: '',
  winner: undefined,
  invalid: false
};

const getWinner = result => {
  if (result.team1.goals > result.team2.goals) {
    return TEAM1;
  }
  if (result.team2.goals > result.team1.goals) {
    return TEAM2;
  }
  if (result.team1.goals === result.team2.goals) {
    return DRAW;
  }
};

const getPoints = (winner, team) => {
  if (winner === team) return 3;
  if (winner === DRAW) return 1;
  return 0;
};

const getTeamName = (team, playerId, name) => {
  const teamUpdated = {
    ...team,
    [playerId]: name,
  };

  return `${teamUpdated[0]}${teamUpdated[1] && ' & '}${teamUpdated[1] && teamUpdated[1]}`; // eslint-disable-line
};

const isValid = state => {
  if (!state.team1.teamName.trim().length) return false;
  if (!state.team2.teamName.trim().length) return false;
  if (state.team2.teamName === state.team1.teamName) return false;
  if (isNaN(state.team1.goals)) return false;
  if (isNaN(state.team2.goals)) return false;

  return true;
}

export default class MatchReport extends Component {
  state = initialState;

  handleMatchType = matchType => {
    this.setState({
      ...this.state,
      matchType: matchTypes[matchType],
      matchTypeId: matchType,
    });
  };

  handleTeamMemberChange = (team, member) =>
    name => {
      this.setState({
        ...this.state,
        [team]: {
          ...this.state[team],
          [member]: name,
          teamName: getTeamName(this.state[team], member, name),
        },
      });
    };

  handleScoreChange = team =>
    goals => {
      goals = parseInt(goals, 10);
      const state = {
        ...this.state,
        [team]: {
          ...this.state[team],
          goals,
        },
      };

      const winner = getWinner(state);

      const newState = {
        score: `${state.team1.goals} - ${state.team2.goals}`,
        winner,
        team1: {
          ...state.team1,
          points: getPoints(winner, TEAM1),
          won: winner === TEAM1
        },
        team2: {
          ...state.team2,
          points: getPoints(winner, TEAM2),
          won: winner === TEAM2
        },
      };

      this.setState(newState);
    };

  handleSubmit = e => {

    if (!isValid(this.state)) {
        this.setState({ invalid: true });
        return true;
    }

    updateLeague(this.state)
      .then(getLeagues)
      .then(leagueTables => {
        this.props.onScoreChange(leagueTables);
        this.setState({...initialState, saved: true});
        setTimeout(
          () => {
            this.setState({...this.state, saved: false});
          },
          SAVE_TIMEOUT,
        );
      })
      .catch(e => {
        this.setState({...this.state, error: true});
      });
  };

  render() {
    return (
      <Report>
        {this.state.saved && <h2> Saved Match Report! </h2>}
        {this.state.score && <h2> Final Score: {this.state.score} </h2>}
        {this.state.invalid && <span> Please complete fields </span>}
        <MatchTypes>
          {Object.keys(matchTypes).map(k => (
            <MatchType
              key={k}
              checked={this.state.matchTypeId === k}
              name={k}
              onChange={this.handleMatchType}
            />
          ))}
        </MatchTypes>
        <div>
          <h2> Team 1 {this.state.team1.teamName && `(${this.state.team1.teamName})`}</h2>
          {Array.from(Array(this.state.matchType.team1).keys()).map(k => (
            <TextInput
              key={`team1_${k}`}
              required
              placeholder={`Player ${k + 1} name`}
              value={this.state.team1[k]}
              onChange={this.handleTeamMemberChange('team1', k)}
            />
          ))}
        </div>
        <div>
          <h2> Team 2 {this.state.team2.teamName && `(${this.state.team2.teamName})`}</h2>
          {Array.from(Array(this.state.matchType.team2).keys()).map(k => (
            <TextInput
              key={`team2_${k}`}
              required
              placeholder={`Player ${this.state.matchType.team1 + k + 1} name`}
              value={this.state.team2[k]}
              onChange={this.handleTeamMemberChange('team2', k)}
            />
          ))}
        </div>
        <div>
          <h2>Final Score</h2>
          <Label> Team 1 </Label>
          <TextInput
            type="number"
            required
            value={this.state.team1.goals}
            onChange={this.handleScoreChange('team1')}
          />
          Vs
          <TextInput
            type="number"
            required
            value={this.state.team2.goals}
            onChange={this.handleScoreChange('team2')}
          />
          <Label> Team 2 </Label>
          <Button onClick={this.handleSubmit}> Submit Score </Button>
        </div>
      </Report>
    );
  }
}
