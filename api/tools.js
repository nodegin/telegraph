import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp-promise'

export const initStore = (file, content) => new Promise((resolve, reject) => {
  mkdirp(path.dirname(file)).then(() => {
    fs.stat(file, (statErr) => {
      if (statErr === null) resolve(file)
      else {
        if (!content) reject('Content parameter is required')
        else fs.writeFile(file, content, (writeErr) => {
          if (writeErr) reject(writeErr)
          else resolve(file)
        })
      }
    })
  })
})

export const readStore = (file) => new Promise((resolve, reject) => {
  fs.readFile(file, (err, data) => {
    if (err) reject(err)
    else resolve(JSON.parse(data))
  })
})

export const updateStore = (file, store) => new Promise((resolve, reject) => {
  fs.writeFile(file, JSON.stringify(store), (writeErr) => {
    if (writeErr) reject(writeErr)
    else resolve(file)
  })
})

export const craftBot = (botProp) => new Promise((resolve, reject) => {

})