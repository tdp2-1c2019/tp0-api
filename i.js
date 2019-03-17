const express = require('express')
const { google } = require('googleapis')

const port = process.env.PORT || 3000
const books = google.books('v1')

const search = async q => {
  let params = {
    q : q,
    projection: "full"
  };
  return books.volumes.list(params)
}

function getDownloadLink(bookAccessInfo){
  if (bookAccessInfo.pdf.isAvailable && typeof bookAccessInfo.pdf.downloadLink != 'undefined'){
    return bookAccessInfo.pdf.downloadLink;
  }
  return "";
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
          name: b.volumeInfo.title || "",
          cover: b.volumeInfo.imageLinks.smallThumbnail || "",
          authors: b.volumeInfo.authors || [],
          description: b.volumeInfo.description || "",
          categories: b.volumeInfo.categories || [],
          downloadLink: getDownloadLink(b.accessInfo)
        })
      })
      res.status(200).json(r)
    } catch (e) {
      res.status(500).json({ message: e })
    }
  }
  else
    res.status(500).json({ message: "FALTA Q" })
})

// #####################################################################

app.listen(port)

// #####################################################################
