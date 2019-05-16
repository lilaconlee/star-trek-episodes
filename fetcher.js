const _ = require('lodash')
const axios = require('axios')
const fs = require('fs')

let allEps = {}
const baseUrl = 'http://api.tvmaze.com/shows/SERIESID/episodes'
const series = {
  TOS: 490,
  TAS: 3513,
  TNG: 491,
  VOY: 492,
  DS9: 493,
  ENT: 714,
  DIS: 7480
}

async function getSeriesData(fullUrl) {
  const res = await axios.get(fullUrl)
  
  if (!res.data) {
    throw Error('no data :(')
  }

  const data = res.data
  const props = [
    'name',
    'season',
    'number',
    'summary'
  ]

  return data.map((ep) => {
    const newEp = _.pick(ep, props)
    return newEp
  })
}

function write(data) {
  fs.writeFile('episodes.json', JSON.stringify(data, null, 4), (err) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('data written to episodes.json')
  })
}


Object.keys(series).forEach(async (s) => {
  const seriesId = series[s]
  const fullUrl = baseUrl.replace('SERIESID', seriesId)

  allEps[s] = await getSeriesData(fullUrl)
})

setTimeout(() => {
  write(allEps)
}, 1000)
