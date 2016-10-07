import fs from 'fs'
import path from 'path'
import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import proxy from 'proxy-middleware'
import socket from 'socket.io'
import {
  initStore,
  readStore,
  updateStore,
  craftBot
} from './tools'
import telegramBot from 'node-telegram-bot-api'

require('monkey-patches-node-telegram-bot-api')(telegramBot, {
  stopPolling: true,
  sendVenue: true,
  answerCallbackQuery: true,
  editMessageText: true,
})

const app = express()
const server = http.createServer(app)
const io = socket(server, { path: '/_' })

server.listen(8080, () => {
  console.log('api server running on 8080')
})

/*  Setup middlewares  */
app.use(bodyParser.json())

/*  Initialize application  */
async function init() {

  const storeFile = path.resolve(__dirname, './store.json')
  /*  Initialize the store if not exists  */
  await initStore(storeFile, JSON.stringify({
    bots: {},
    chats: {},
  }))
  let Store = await readStore(storeFile)
  let Chain = Promise.resolve()
  let Bots = {}

  /* Routes */

  io.on('connection', (socket) => {
    socket.emit('syncStore', Store)
    socket.on('sendText', (data) => {
      Bots[data.bot].sendMessage(data.chat, data.text)
    })
  })

  app.post('/parking', async (req, res) => {
    if (!req.body.token) {
      res.send(false)
      return
    }
    const id = req.body.token.split(':')[0]
    let chats = []
    if (Store.bots[id]) {
      chats = Store.bots[id].chats
    }
    let bot = new telegramBot(req.body.token, {
      polling: {
        interval: 50,
      }
    })
    /*  Timeout the getMe() action after 2.5 seconds  */
    const timeout = setTimeout(() => {
      bot.stopPolling()
      res.send(false)
    }, 2500)
    const info = await bot.getMe()
    if (info) {
      /*  Response received, unset the timeout  */
      clearTimeout(timeout)
      bot.stopPolling()
      bot = null
      Store.bots[id] = {
        id,
        name: info.first_name,
        username: info.username,
        token: req.body.token,
        chats,
      }
      Chain = Chain.then(() => updateStore(storeFile, Store))
      await Chain
      io.emit('syncStore', Store)
      res.send(true)
    }
  })

  /*  Must be under routes  */
  if (process.env.NODE_ENV !== 'production') {
    app.use('/', proxy('http://127.0.0.1:8081/'))

    app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../app/index.html'))
    })
  } else {
    app.use(express.static(path.resolve(__dirname, '../dist')))
  }

  for (let botId in Store.bots) {
    const props = Store.bots[botId]
    Bots[botId] = new telegramBot(props.token, {
      polling: {
        interval: 99,
        timeout: 0,
      }
    })
    Bots[botId].on('new_chat_participant', async (msg) => {
      const chatId = String(msg.chat.id)
      const memId = String(msg.new_chat_member.id)
      /* If Bot was added to group */
      if (memId === botId) {
        /* Check if Bot already added to group */
        if (Store.bots[botId].chats.indexOf(chatId) < 0) {
          Store.bots[botId].chats.push(chatId)
        }
        Store.chats[chatId] = {
          id: chatId,
          title: msg.chat.title,
          type: msg.chat.type,
        }
        /*  Update the store  */
        Chain = Chain.then(() => updateStore(storeFile, Store))
        await Chain
        io.emit('syncStore', Store)
      }
    })
    Bots[botId].on('left_chat_participant', async (msg) => {
      const chatId = String(msg.chat.id)
      const memId = String(msg.left_chat_member.id)
      /*  Save remove from store  */
      if (memId === botId) {
        Store.bots[botId].chats = Store.bots[botId].chats.filter((id) => id !== chatId)
        /* Check whatever if the group id is not belonging to any Bot */
        let useless = true
        for (let _id in Store.bots) {
          if (useless) {
            useless = Store.bots[_id].chats.indexOf(chatId) < 0
          }
        }
        /* Perform Garbage Collection for the useless group */
        if (useless) {
          Store.chats = Object.keys(Store.chats)
          .filter(id => id !== chatId)
          .reduce((result, current) => {
            result[current] = Store.chats[current]
            return result
          }, {})
        }
        /*  Update the store  */
        Chain = Chain.then(() => updateStore(storeFile, Store))
        await Chain
        io.emit('syncStore', Store)
      }
    })
    Bots[botId].on('message', async (msg) => {
      /*  Ignore since catched above  */
      if (msg.new_chat_participant || msg.left_chat_participant) {
        return
      }
      /*  Fill missing group  */
      const chatId = String(msg.chat.id)
      if (Store.bots[botId].chats.indexOf(chatId) < 0) {
        if (Store.bots[botId].chats.indexOf(chatId) < 0) {
          Store.bots[botId].chats.push(chatId)
        }
        Store.chats[chatId] = {
          id: chatId,
          title: msg.chat.title,
          type: msg.chat.type,
        }
        Chain = Chain.then(() => updateStore(storeFile, Store))
        await Chain
        io.emit('syncStore', Store)
      }
      io.emit('message', { bot: botId, msg })
    })
  }
}

init()
