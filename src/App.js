import React, { Component } from 'react';
import styled, { injectGlobal } from 'styled-components';
import withHandlers from 'recompose/withHandlers';
import localforage from 'localforage';
import { sortBy, flow, map } from 'lodash/fp';

const colors = {
  hazel: '#DFD7CC',
  moss: '#89A27B',
  squash: '#427258',
  turquoise: '#43625D',
  footprintinthestorm: '#43625D',
  offwhite: '#f2f2f2',
};

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

injectGlobal`
  body, html, #root {
    width: 100%;
    height: 100%;
    color: ${colors.offwhite};
    margin: 0;
    padding: 0;
    background: ${colors.turquoise};
  }

  * {
    box-sizing: border-box;
  }
`;

let MatchType = props => <MatchTypeWrapper>
  <Label onChange={props.onChange}>{props.name}</Label>
  <Checkbox
    name={props.name}
    checked={props.checked}
    onChange={props.onChange}
  />
</MatchTypeWrapper>

MatchType = withHandlers({
  onChange: props => e => {
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
`
const Report = styled.div`
  padding: 2em;
`
const MatchTypes = styled.div`
  display: flex;
`;
const Button = styled.button`
  display: flex;
`;


const OneVsOne = '1vs1';
const OneVsTwo = '1vs2';
const TwoVsTwo = '2vs2';
const matchTypes = {
  [OneVsOne]: {
    OneVsOne,
    team1: 1,
    team2: 1
  },
  [OneVsTwo]: {
    OneVsTwo,
    team1: 1,
    team2: 2
  },
  [TwoVsTwo]: {
    TwoVsTwo,
    team1: 2,
    team2: 2
  }
};

let TextInput = props => <Input {...props} value={props.value}/>
TextInput = withHandlers({
  onChange: props => e => props.onChange(e.target.value)
})(TextInput);

const SAVE_TIMEOUT = 5000;
const getScores = () =>
    localforage.getItem('scores')
    .then((scores = {}) => scores);

const addNewScore = score => scores => {
  console.log(scores);
  return localforage.setItem('scores', {
    ...scores,
    [Date.now().toString()]: score
  });
};

const initialState = {
  matchType: matchTypes[OneVsOne],
  matchTypeId: OneVsOne,
  team1: { 0: '', 1: '', goals: '' },
  team2: { 0: '', 1: '', goals: '' },
  saved: false,
  error: false,
  score: '',
};

class MatchReport extends React.Component {
  state = initialState;

  handleMatchType = matchType => {
    this.setState({
      ...this.state,
      matchType: matchTypes[matchType],
      matchTypeId: matchType,
    });
  }

  handleTeamMemberChange = (team, member) => name => {
    this.setState({
      ...this.state,
      [team]: {
        ...this.state[team],
        [member]: name
      }
    })
  }

  handleScoreChange = team => goals => {
      const intermediateState = {
          ...this.state,
          [team]: {
            ...this.state[team],
            goals
          }
      };
      const newState = {
        ...intermediateState,
        score: `${intermediateState.team1.goals} - ${intermediateState.team2.goals}`, // eslint-disable-line
      }

      this.setState(newState);
  }

  handleSubmit = () => {
    getScores()
    .then(addNewScore(this.state))
    .then(getScores)
    .then(scores => {
      this.props.onScoreChange(scores);
      this.setState({ ...initialState, saved: true });
      setTimeout(() => {
        this.setState({ ...this.state, saved: false });
      }, SAVE_TIMEOUT);
    })
    .catch(e => {
      this.setState({ ...this.state, error: true });
    });
  }

  render() {
    return (<Report>
      {this.state.saved && <h2> Saved Match Report! </h2>}
      {this.state.score && <h2> Final Score: {this.state.score} </h2> }
      <MatchTypes>
        {
          Object.keys(matchTypes)
            .map(k =>
              <MatchType
                key={k}
                checked={this.state.matchTypeId === k}
                name={k}
                onChange={this.handleMatchType}
              />
            )
        }
      </MatchTypes>
      <div>
        <h2> Team 1 </h2>
        {
          Array.from(Array(this.state.matchType.team1).keys())
          .map(k => <TextInput
                      key={`team1_${k}`}
                      placeholder={`Player ${k+1} name`}
                      value={this.state.team1[k]}
                      onChange={this.handleTeamMemberChange('team1', k)}
                    />)
        }
      </div>
      <div>
        <h2> Team 2 </h2>
        {
          Array.from(Array(this.state.matchType.team2).keys())
          .map(k => <TextInput
                      key={`team2_${k}`}
                      placeholder={
                        `Player ${this.state.matchType.team1 + k + 1} name`
                      }
                      value={this.state.team2[k]}
                      onChange={this.handleTeamMemberChange('team2', k)}
                    />)
        }
      </div>
      <div>
        <h2>Final Score</h2>
        <Label> Team 1 </Label>
        <TextInput
          value={this.state.team1.goals}
          onChange={this.handleScoreChange('team1')}
        />
        Vs
        <TextInput
          value={this.state.team2.goals}
          onChange={this.handleScoreChange('team2')}
        />
        <Label> Team 2 </Label>
        <Button onClick={this.handleSubmit}> Submit Score </Button>
      </div>
    </Report>);
  }
}

const sortScoreByIds = flow(
  map(n => parseInt(n)),
  sortBy(n => n),
);
class App extends Component {
  state = { scores: {}, idsSortedByDate: [] };
  componentDidMount() {
    getScores()
    .then(this.handleScoreChange);
  }
  handleScoreChange = scores => {
    this.setState({
      ...this.state,
      scores,
      idsSortedByDate: sortScoreByIds(Object.keys(scores))
    });
  }
  render() {
    console.log(this.state.idsSortedByDate)
    return (
      <AppWrapper>
        <Heading> Foosball Champion Table </Heading>
        <MatchReport onScoreChange={this.handleScoreChange}/>
        { JSON.stringify(this.state.idsSortedByDate)}
        {/* { JSON.stringify(this.state.scores) } */}
      </AppWrapper>
    );
  }
}

export default App;
