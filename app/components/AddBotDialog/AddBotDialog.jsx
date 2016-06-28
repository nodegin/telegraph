import 'isomorphic-fetch';
import React from 'react';
import {
  Dialog,
  FlatButton,
  Snackbar,
  TextField,
} from 'material-ui';

export default class AddBotDialog extends React.Component {
  componentWillReceiveProps() {
    /*  reset when component was shown / hidden  */
    this.setState({
      disabled: true,
      error: null,
      message: null,
      token: '',
    })
  }

  handleChange = (e) => {
    const token = e.target.value
    this.setState({ token })
    if (null !== token.match(/^\d{9}\:[a-zA-Z0-9-_]{35}$/)) {
      this.setState({
        disabled: false,
        error: null,
        message: null,
      })
    } else {
      this.setState({
        disabled: true,
        error: 'Bot Token is not valid',
        message: null,
      })
    }
  }

  async handleSubmit() {
    this.setState({
      disabled: true,
      message: null,
    })
    let result = await fetch(`/parking`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        token: this.state.token,
      }),
    })
    result = await result.json()
    if (result) {
      this.props.onClose()
    } else {
      this.setState({
        disabled: false,
        message: 'An error occurred'
      })
    }
  }

  render() {
    return this.props.open ? (
      <div>
        <Dialog
          actions={[
            <FlatButton
              label="Cancel"
              onTouchTap={this.props.onClose.bind(this)} />,
            <FlatButton
              label="Add Bot"
              disabled={this.state.disabled}
              onTouchTap={this.handleSubmit.bind(this)} />,
          ]}
          contentStyle={{
            width: '480px',
          }}
          modal={false}
          open={true}>
          New Bot
          <br />
          <TextField
            hintText="Bot Token"
            errorText={this.state.error}
            fullWidth={true}
            value={this.state.token}
            onChange={this.handleChange} />
        </Dialog>
        <Snackbar
          open={this.state.message !== null}
          message={this.state.message !== null ? this.state.message : ''}
          autoHideDuration={2500}
          style={{
            margin: '0 auto',
            width: '320px',
          }} />
      </div>
    ) : null;
  }
}
