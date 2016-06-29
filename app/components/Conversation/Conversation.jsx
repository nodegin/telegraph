import $ from './Conversation.css'
import classNames from 'classnames'
import React from 'react'
import ReactDOM from 'react-dom'
import { Avatar, IconButton, TextField } from 'material-ui'

class Messages extends React.Component {
  componentDidUpdate() {
    /*  Scroll to bottom automatically  */
    const node = ReactDOM.findDOMNode(this)
    node.scrollTop = node.scrollHeight
  }
  render() {
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    )
  }
}

export default class Conversation extends React.Component {

  state = {
    chatContent: '',
    botMessages: {},
  }

  botMessages = {}

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
    if (!this.botMessages[this.props.chat.id]) {
      this.botMessages[this.props.chat.id] = []
    }
    this.botMessages[this.props.chat.id].push({
      chat: {
        id: this.props.chat.id,
        title: this.props.chat.title,
        type: this.props.chat.type,
      },
      date: +new Date,
      from: {
        first_name: this.props.bot.name,
        id: this.props.bot.id,
        username: this.props.bot.username,
      },
      message_id: -1,
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
        <Messages className={$.messages}>
        {
          this.props.messages.filter((msg) => {
            return String(msg.chat.id) === this.props.chat.id
          }).concat(
            this.botMessages[this.props.chat.id] ? this.botMessages[this.props.chat.id] : []
          ).sort((a, b) => {
            if (a.date < b.date)
              return -1
            if (a.date > b.date)
              return 1
            return 0
          }).map((msg) => {
            let content = null
            if (msg.text) {
              content = <div>{msg.text}</div>
            }
            return (
              <div className={$.messageHolder}>
                <div className={$.avatar}>
                  <Avatar src="http://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png" />
                </div>
                <div className={$.messageContentContainer}>
                  <div className={$.messageContent}>{content}</div>
                </div>
              </div>
            )
          })
        }
        </Messages>
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
