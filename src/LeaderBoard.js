import React, {Component} from 'react';
import {ONE_VS_ONE, ONE_VS_TWO, TWO_VS_TWO} from './constants';

export default class LeaderBoard extends Component {
  state = {filter: ONE_VS_ONE};

  handleFilter = filter =>
    e => {
      e.preventDefault();

      this.setState({
        filter,
      });
    };
  render() {
    return (
      <div>
        <div>
          <button onClick={this.handleFilter(ONE_VS_ONE)}>
            One Vs One League Table
          </button>
          <button onClick={this.handleFilter(ONE_VS_TWO)}>
            One Vs Two League Table
          </button>
          <button onClick={this.handleFilter(TWO_VS_TWO)}>
            Two Vs Two League Table
          </button>
        </div>
        {this.state.filter === ONE_VS_ONE && <h2> Showing One Vs One League Table </h2>}
        {this.state.filter === ONE_VS_TWO && <h2> Showing One Vs Two League Table </h2>}
        {this.state.filter === TWO_VS_TWO && <h2> Showing Two Vs Two League Table </h2>}
        <table>
          <tbody>
            <tr>
              <th> Position </th>
              <th> Team </th>
              <th> Goals </th>
              <th> Won </th>
              <th> Lost </th>
              <th> Points </th>
            </tr>
            {this.props.leagues[this.state.filter].map((r, i) => (
              <tr key={r.team}>
                <td> {i + 1} </td>
                <td> {r.team} </td>
                <td> {r.goals} </td>
                <td> {r.won} </td>
                <td> {r.lost} </td>
                <td> {r.points} </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
