import React from 'react';
import ReactDOM from 'react-dom';
import { MuiThemeProvider, getMuiTheme } from 'material-ui/styles';
import { App } from './components';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const app = document.querySelector('#app');
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#28A5D4',
    accent1Color: '#4170B7',
    borderColor: '#B5B5B7',
    disabledColor: '#CECECF',
    pickerHeaderColor: '#E8EAF6',
    clockCircleColor: '#E8EAF6',
  },
  appBar: {
    color: '#FFFFFF',
    textColor: '#000000'
  }
});

ReactDOM.render(
  <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
    <App />
  </MuiThemeProvider>,
  app
);

setTimeout(() => {
  app.setAttribute('style', 'height:100%');
}, 250)
