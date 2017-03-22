import localforage from 'localforage';

const getResults = () => localforage.getItem('results').then((results = {}) => results);

const addResult = result =>
  results =>
    localforage.setItem('results', {
      ...results,
      [Date.now().toString()]: result,
    });

export const addNewResult = result => getResults().then(addResult(result));
