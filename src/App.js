import React, {Component} from 'react';
import styled from 'styled-components';
import { ONE_VS_ONE, ONE_VS_TWO, TWO_VS_TWO } from './constants';
import { getLeagues } from './league';
import LeaderBoard from './LeaderBoard';
import MatchReport from './MatchReport';


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
