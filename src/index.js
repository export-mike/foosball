import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import colors from './colors';
import {injectGlobal} from 'styled-components';
/* eslint-disable */
injectGlobal`
  body, html, #root {
    width: 100%;
    height: 100%;
    color: ${colors.offwhite};
    margin: 0;
    padding: 0;
    background: ${colors.turquoise};
    font-family: helvetica
  }

  * {
    box-sizing: border-box;
  }
`;
/* eslint-enable */

ReactDOM.render(<App />, document.getElementById('root'));
