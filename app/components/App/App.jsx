import $ from './App.css';
import React from 'react';
import { Paper, RaisedButton } from 'material-ui';
import { CircularProgress, Telegraph } from '../../components';
import { VelocityComponent } from 'velocity-react';

export default class App extends React.Component {
  state = {
    loaded: false
  }

  onLoad = (loaded) => {
    this.setState({ loaded })
  }

  render() {
    return (
      <div className={$.flexWrapper}>
        <VelocityComponent animation={{ opacity: this.state.loaded ? 1 : 0, marginTop: this.state.loaded ? 0 : 24 }} duration={150} >
          <Paper className={$.main}>
            <Telegraph onLoad={this.onLoad} />
          </Paper>
        </VelocityComponent>
        <VelocityComponent animation={{ opacity: this.state.loaded ? 0 : 1 }} duration={150} >
          <CircularProgress
            color="#E8EAF6"
            completed={this.state.loaded}
            size={64} />
        </VelocityComponent>
      </div>
    );
  }
}
