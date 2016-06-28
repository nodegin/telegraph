import $ from './Conversation.css'
import classNames from 'classnames'
import React from 'react'
import { IconButton, TextField } from 'material-ui'

export default class Conversation extends React.Component {

  state = {
    chatContent: ''
  }

  handleEnter = (e) => {
    if (e.keyCode === 13) {
      this.sendMessage()
    }
  }

  handleChange = e => this.setState({ chatContent: e.target.value })

  sendMessage = () => {
    this.props.socket.emit('sendText', {
      bot: this.props.bot.id,
      chat: this.props.chat.id,
      text: this.state.chatContent,
    })
    this.setState({ chatContent: '' })
  }

  render() {
    return (
      <div className={$.root}>
        <header className={classNames($.header, $.paperToolbar)}>
          <div>
            <span>{this.props.chat.title}</span>
            <br />
            <small>Bot: {this.props.bot.name}</small>
          </div>
        </header>
        <div className={$.messages}>
        {
          this.props.messages.filter((msg) => {
            return String(msg.chat.id) === this.props.chat.id
          }).map((msg) => {
            return (
              <div>
                {JSON.stringify(msg)}
                <hr />
              </div>
            )
          })
        }
        </div>
        <footer className={classNames($.footer, $.paperToolbar)}>
          <IconButton className={$.button} iconClassName="mdi-emoticon" />
          <div className={$.inputField}>
            <TextField
              fullWidth={true}
              onKeyDown={this.handleEnter}
              value={this.state.chatContent}
              onChange={this.handleChange} />
          </div>
          <IconButton
            className={$.button}
            iconClassName="mdi-send"
            onClick={this.sendMessage} />
        </footer>
      </div>
    );
  }
}
