import React, {Component} from 'react';
import styled from 'styled-components';
import withHandlers from 'recompose/withHandlers';
import {TEAM1, DRAW, TEAM2, ONE_VS_ONE, ONE_VS_TWO, TWO_VS_TWO, matchTypes} from './constants';
import {updateLeague, getLeagues} from './league';
import LeaderBoard from './LeaderBoard';

const AppWrapper = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  align-content: stretch;
  margin: 0 auto;
  padding: 40px;
`;

const Heading = styled.div`
  text-align: center;
  font-size: 2em;
`;

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
const Report = styled.form`
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

class MatchReport extends React.Component {
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
        },
        team2: {
          ...state.team2,
          points: getPoints(winner, TEAM2),
        },
      };

      this.setState(newState);
    };

  handleSubmit = () => {
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

class App extends Component {
  state = {
    leagues: {
      [ONE_VS_ONE]: [],
      [ONE_VS_TWO]: [],
      [TWO_VS_TWO]: [],
    },
    error: null,
  };

  componentDidMount() {
    getLeagues().then(this.handleScoreChange).catch(e => {
      this.setState({
        error: e,
      });
    });
  }
  handleScoreChange = leagues => {
    this.setState({
      ...this.state,
      leagues,
    });
  };
  render() {
    if (this.state.error) {
      return (
        <AppWrapper>
          <Heading> Foosball Champion Table </Heading>
          <h2> Currently Unavailable :( </h2>
          {this.state.error.message}
          {this.state.error.stack}
        </AppWrapper>
      );
    }
    return (
      <AppWrapper>
        <Heading> Foosball Champion Table </Heading>
        <MatchReport onScoreChange={this.handleScoreChange} />
        <LeaderBoard leagues={this.state.leagues} />
      </AppWrapper>
    );
  }
}

export default App;
