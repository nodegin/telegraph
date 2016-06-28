import $ from './CircularProgress.css';
import React from 'react';

export default class CircularProgress extends React.Component {
  render() {
    return (
      this.props.completed ? null :
      <div className={$.wrapper}>
        <svg className={$.spinner} width={`${this.props.size}px`} height={`${this.props.size}px`} viewBox="0 0 52 52">
          <circle className={$.path} cx="26px" cy="26px" r="20px" fill="none" stroke={this.props.color}></circle>
        </svg>
      </div>
    );
  }
}
