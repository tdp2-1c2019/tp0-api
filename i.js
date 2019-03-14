const express = require('express')
const { google } = require('googleapis')

const port = process.env.PORT || 3000
const books = google.books('v1')

const search = async q => {
  return books.volumes.list({ q })
}

var app = express()
app.get('/api/books', async function (req, res) {
  let q = (req.query.q || "").trim()
  if (q != "") {
    try {
      let result = await search(q)
      let r = {
        totalItems: result.data.totalItems,
        items: []
      }
      result.data.items.forEach(b => {
        r.items.push({
          name: b.volumeInfo.title,
          authors: b.volumeInfo.authors,
          description: b.volumeInfo.description,
          categories: b.volumeInfo.categories
        })
      })
      res.send(JSON.stringify(r))
    } catch (e) {
      res.send(e)
    }
  }
  else
    res.send("FALTA Q")
})

// #####################################################################

app.listen(port)

// #####################################################################
