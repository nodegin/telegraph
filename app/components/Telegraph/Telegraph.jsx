import $ from './Telegraph.css'
import React from 'react'
import {
  Avatar,
  FloatingActionButton,
  FontIcon,
  List,
  ListItem,
  Subheader,
} from 'material-ui'
import { AddBotDialog, Conversation } from '../../components'
import io from 'socket.io-client'

export default class Telegraph extends React.Component {
  state = {
    addBotFormOpen: false,
    newBotToken: '',
    activeChat: null,
    bots: {},
    chats: {},
    messages: {},
  }

  socket = io(undefined, { path: '/_' })

  async componentDidMount() {
    this.props.onLoad(true)
    this.socket.on('syncStore', (store) => this.setState(store))
    this.socket.on('message', (data) => {
      let messages = this.state.messages[data.bot]
      if (!messages) {
        messages = []
      }
      messages.push(data.msg)
      /*  GC old messages > 1000  */
      if (messages.length > 1) {
        messages = messages.slice(Math.max(messages.length - 1000, 0))
      }
      this.setState({
        messages: {
          ...this.state.messages,
          [data.bot]: messages
        }
      })
    })
  }

  toggleAddBotDialog = () => {
    this.setState({
      addBotFormOpen: !this.state.addBotFormOpen
    })
  }

  openChat(botId, chatId) {
    let activeChat = [botId, chatId]
    if (this.state.activeChat !== null) {
      const [activeBotId, activeChatId] = this.state.activeChat
      /*  close the conversation on toggle  */
      if (activeBotId === botId && activeChatId === chatId) {
        activeChat = null
      }
    }
    this.setState({ activeChat })
  }

  render() {
    const listItems = []
    for (let botId in this.state.bots) {
      listItems.push(<Subheader>{this.state.bots[botId].name}</Subheader>)
      if (this.state.bots[botId].chats.length < 1) {
        listItems.push(<Subheader inset={true}>No group was found for this bot.</Subheader>)
      }
      for (let chatId of this.state.bots[botId].chats) {
        console.log(this.state.bots[botId], chatId)
        listItems.push(
          <ListItem
            leftAvatar={<Avatar src="http://icons.iconarchive.com/icons/mahm0udwally/all-flat/256/User-icon.png" />}
            primaryText={this.state.chats[chatId].title}
            onTouchTap={this.openChat.bind(this, botId, chatId)} />
        )
      }
    }
    return (
      <div className={$.content}>
        <div className={$.chatsContainer}>
          <div className={$.chatsScrollWrapper}>
          {
            listItems.length < 1 ? (
              <div className={$.infoWrapper}>
                No bot was found
              </div>
            ) : (
              <List>{listItems}</List>
            )
          }
          </div>
          <div className={$.fabAdd}>
            <FloatingActionButton
              secondary={true}
              onMouseUp={this.toggleAddBotDialog}>
              <FontIcon className="mdi-plus" />
            </FloatingActionButton>
          </div>
        </div>
        {
          this.state.activeChat !== null ? (
            <Conversation
              bot={this.state.bots[this.state.activeChat[0]]}
              chat={this.state.chats[this.state.activeChat[1]]}
              messages={
                this.state.messages[this.state.activeChat[0]] ?
                this.state.messages[this.state.activeChat[0]] :
                []
              }
              socket={this.socket} />
          ) : (
            <div className={$.infoWrapper}>
              No group selected
            </div>
          )
        }
        <AddBotDialog
          open={this.state.addBotFormOpen}
          onClose={this.toggleAddBotDialog}/>
      </div>
    );
  }
}
