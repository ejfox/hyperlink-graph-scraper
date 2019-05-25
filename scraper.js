const reqp = require('request-promise')
const cheerio = require('cheerio')
const _ = require('lodash')
const scrapeDomain = 'ejfox.com'
// Need to be sure this doesn't end with a `/`
const startURL = 'https://ejfox.com'


// TODO: Figure out how to make recursivelyScrapeURL
// Actually run recursively on all the URLs from the 
// first page that is scraped
//
// Maybe a promise queueing library like
// https://github.com/kriskowal/q
// https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
// https://stackoverflow.com/questions/50270232/scrape-all-of-sublinks-of-a-website-recursively-in-python-using-beautiful-soup/50308980#50308980
// 
// Or something like that... idk, i'm tired

/*
           ┌─────────────────────────┐  Given a sourceURL
           │                         │  this script will go
           │   + Link one            │  through and look at
           │   + Link two            │  every link on that
           │   + Link three          │  webpage
           │                         │
           └─────────────────────────┘
                        │
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
  ┌───────────┐   ┌───────────┐    ┌───────────┐
  │           │   │           │    │           │
  │           │   │           │    │           │    and then go to each
  │Link one   │   │Link two   │    │Link three │    of those pages
  │           │   │           │    │           │
  │           │   │           │    │           │
  └───────────┘   └───────────┘    └───────────┘
        │               │                │
  ┌─────┼──────┐      ┌─┴──┐    ┌────┬───┴┬────┐
  ▼     ▼      ▼      ▼    ▼    ▼    ▼    ▼    ▼    and so on...
┌──┐  ┌──┐   ┌──┐   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│  │  │  │   │  │   │  │ │  │ │  │ │  │ │  │ │  │
└──┘  └──┘   └──┘   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘
*/


function scrapeUrlLinks (startUrl) {
  return reqp(startUrl).then(body => {
    const $ = cheerio.load(body)
    let hyperlinks = $('a:link')
    let mappedHyperlinks = _.map(hyperlinks, (h) => {
      return h.attribs.href
    })
    return {
      startUrl,
      links: mappedHyperlinks
    }
  })
}

function recursivelyScrapeUrl (startUrl) {
  const visitedUrls = []
  return scrapeUrlLinks(startUrl)
    .then(links => {
      // First we scrape our startUrl
      // Which is node zero, the place from which
      // all other links are begotten 
      //
      // It returns an object with the 
      // `startUrl` and an array of `links`
      //
      // First an array that we will fill with nodes
      // One for every link our scrapes sees
      // (Inlcuding the original startUrl)
      const nodes = []
 
      // Add the startURL as a node
      nodes.push({
        url: links.startUrl
      })
      
      // And an edges array, which will be drawn
      // Between nodes, every time a page links to another
      const edges = []
      
      // Now go through every link on that startUrl page
      _.each(links.links, l => {
       // Add this link to the nodes
        nodes.push({ id: l })
        // Add this link to the visited URLs
        visitedUrls.push(l)
        // Make a edge between the sourceURL
        // and this link
        edges.push({
          source: sourceUrl,
          target: l
        }
      })
    })
}

scrapeUrlLinks(startURL).then(links => {
  console.log('Links!! ', links)
   links.links = _.map(links.links, l => {
    const linkStart = l.substring(0,4)
    console.log('linkStart ->', linkStart)
    if (linkStart === 'http') return l
    else {
      return links.startUrl + l
    }
  })
  console.log('Links ->', links.links)
  
}).catch(err => {
  console.log('Error: ', err)
})

