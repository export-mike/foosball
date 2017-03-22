import React, { Component } from 'react';
// import styled from 'styled-components';
import { sortBy, flow, map, filter } from 'lodash/fp';

const ONE_VS_ONE_LEAGUE = 'ONE_VS_ONE_LEAGUE';
const TWO_VS_TWO_LEAGUE = 'TWO_VS_TWO_LEAGUE';
const ONE_VS_TWO_LEAGUE = 'ONE_VS_TWO_LEAGUE';
const INDIVIDUAL_SCORERS = 'INDIVIDUAL_SCORERS';
const CHAMPIONS = 'CHAMPIONS';

const noop = n => n;
const filterByTeam = noop;
const filterByChampions = flow(
  getWinners()
);
const filterByIndividuals = noop;
const filterByScorers = noop;

const filters = {
  [ONE_VS_ONE_LEAGUE]: filterByIndividuals,
  [ONE_VS_TWO_LEAGUE]: filterByTeam,
  [TWO_VS_TWO_LEAGUE]: filterByTeam,
  [CHAMPIONS]: filterByChampions,
  [INDIVIDUAL_SCORERS]: filterByScorers
};

export default class LeaderBoard extends Component {
  handleFilter = filter => e => {
    e.preventDefault();

    this.setState({
      filter,
      table: filters[filter](this.props.results)
    });
  }
  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleFilter(ONE_VS_ONE_LEAGUE)}>
            Top Individuals
          </button>
          <button onClick={this.handleFilter(TWO_VS_TWO_LEAGUE)}>
            Top Teams
          </button>
          <button onClick={this.handleFilter(INDIVIDUAL_SCORERS)}>
            Top Scorers
          </button>
        </div>

        {
          this.state.filter === CHAMPIONS &&
          <h2> Showing Top of the Top </h2>
        }
        {
          this.state.filter === ONE_VS_ONE_LEAGUE &&
          <h2> Showing Top Individuals </h2>
        }
        {
          this.state.filter === TWO_VS_TWO_LEAGUE &&
          <h2> Showing Top Teams </h2>
        }
        {
          this.state.filter === INDIVIDUAL_SCORERS &&
          <h2> Showing Top Teams </h2>}
      </div>
    );
  }
}
