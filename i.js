const express = require('express');
const {google} = require('googleapis');

const port = process.env.PORT || 3000;
const books = google.books('v1');

const MAX_REQUEST_RESULTS = 25;
const MAX_BOOK_RESULTS = 100;

const search = async (q, offset) => {
  let params = {
    q: q,
    orderBy: "relevance",
    maxResults: MAX_REQUEST_RESULTS,
    startIndex: offset,
    projection: "full",
  };
  return books.volumes.list(params)
};

function getDownloadLink(bookAccessInfo) {
  if (bookAccessInfo.pdf.isAvailable && typeof bookAccessInfo.pdf.downloadLink != 'undefined') {
    return bookAccessInfo.pdf.downloadLink;
  }
  return "";
}

const app = express();

app.get('/api/books', async function (req, res) {
  let q = (req.query.q || "").trim();
  if (q !== "") {
    try {
      let offset = 0;
      let r = {
        totalItems: 0,
        items: [],
      };

      let result;
      do {
        result = await search(q, offset);
        if (!Boolean(result.data.items)) break;

        result.data.items.forEach(b => {
          r.items.push({
            name: b.volumeInfo.title || "",
            cover: (b.volumeInfo.imageLinks ? b.volumeInfo.imageLinks.smallThumbnail : ""),
            authors: b.volumeInfo.authors || [],
            description: b.volumeInfo.description || "",
            categories: b.volumeInfo.categories || [],
            downloadLink: getDownloadLink(b.accessInfo),
          })
        });
        offset += MAX_REQUEST_RESULTS;
      } while (result.data.items.length > 0 && offset < MAX_BOOK_RESULTS);
      r.totalItems = r.items.length;

      res.status(200).json(r);
    } catch (e) {
      res.status(500).json({message: e});
    }
  } else res.status(500).json({message: "FALTA Q"});
});

// #####################################################################

app.listen(port);

// #####################################################################
