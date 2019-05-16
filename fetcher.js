const _ = require('lodash')
const axios = require('axios')
const fs = require('fs')

let allEps = {}
const baseUrl = 'http://api.tvmaze.com/shows/SERIESID/episodes'
const memoryAlphaBaseUrl = 'https://memory-alpha.fandom.com/wiki/NAME_(episode)'
const series = {
  TOS: 490,
  TAS: 3513,
  TNG: 491,
  VOY: 492,
  DS9: 493,
  ENT: 714,
  DIS: 7480
}

async function getSeriesData(fullUrl, s) {
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
    let newEp = _.pick(ep, props)
    newEp.url = getMemoryAlphaUrl(newEp.name, s)

    return newEp
  })
}

function getMemoryAlphaUrl(name, s) {
  let formattedName = encodeURIComponent(name.replace(/ /g, '_'))

  switch (s) {
    case 'TOS':
      formattedName = formattedName.replace('_(1)', '%2C_Part_I')
        .replace('_(2)', '%2C_Part_II')
        .replace('Operation%3A', 'Operation_--') // TOS 1x29
      break
    case 'TAS':
      formattedName = formattedName.replace('Planets_is_', 'Planets_Is_') // TAS 1x03 
        .replace('%3F', '') // Question marks: TAS 2x05
      break
    case 'TNG':
      if (name === 'Déjà Q') {
        formattedName = 'Deja_Q' // TNG 3x13
      } else {
        formattedName = formattedName.replace('_(1)', '%2C_Part_I')
          .replace('_(2)', '%2C_Part_II')
          .replace(/Farpoint%2C_Part_I*/, 'Farpoint') // TNG 1x01/02
          .replace('When_the', 'When_The') // TNG 1x17 (TNG 3x17 requires of_the)
          .replace('Up_the', 'Up_The') // TNG 2x18
          .replace('Watches_the', 'Watches_The') // TNG 3x04
          .replace('as_a', 'As_A') // TNG 2x05 
          .replace('Matter_of_H', 'Matter_Of_H') // TNG 2x08 (TNG 3x14 requires Matter_of)
          .replace('_of_a_', '_Of_A_') // TNG 2x09 
          .replace('_of_The_', '_of_the_') // TNG 3x17
          .replace('%3F', '') // Question marks: TNG 2x16, 3x04
          .replace(/Worlds%2C_Part_I*/, 'Worlds') // TNG 3x26 
          .replace(/Redemption%2C_Part_I$/, 'Redemption') // TNG 4x26
          .replace(/Redemption%2C_Part_II$/, 'Redemption_II') // TNG 5x01
          .replace(/Unification%2C_Part_I$/, 'Unification_I') // TNG 5x07
          .replace(/Unification%2C_Part_II$/, 'Unification_II') // TNG 5x08
          .replace('I%2C_B', 'I_B') // TNG 5x23
          .replace(/Arrow%2C_Part_I$/, 'Arrow') // TNG 5x26
          .replace(/Descent%2C_Part_I$/, 'Descent') // TNG 6x26
          .replace(/Things...%2C_Part_I*/, 'Things...')
      }
      break
    case 'DS9':
      formattedName = formattedName.replace(/Emissary.*/, 'Emissary') // DS9 1x01, 1x02
        .replace(/Warrior.*/, 'Warrior') // 4x01/02
        .replace(/^\.\.\./, '') // 5x04
        .replace('Who_is', 'Who_Is') // 5x07
        .replace(/Leave_Behind.*/, 'Leave_Behind') // 7x25/26
      break
    case 'VOY':
      formattedName = formattedName.replace(/Caretaker.*/, 'Caretaker') // 1x01, 1x02
        .replace(/End%2C_Part_I$/, 'End')
        .replace('The_Darkling', 'Darkling')
        .replace(/Scorpion%2C_Part_I$/, 'Scorpion')
        .replace(/Hell%2C_Part_I$/, 'Hell')
        .replace(/Equinox%2C_Part_I$/, 'Equinox')
        .replace(/Killing_Game%2C_Part_I$/, 'Killing_Game')
        .replace(/Zero%2C_Part_I$/, 'Zero')
        .replace(/Workforce%2C_Part_I$/, 'Workforce')
        .replace(/Dark_Frontier.*/, 'Dark_Frontier')
        .replace(/Flesh_and_Blood.*/, 'Flesh_and_Blood')
        .replace(/Endgame.*/, 'Endgame')
        .replace('Tinker%2C_Tenor%2C_Doctor%2C_Spy', 'Tinker_Tenor_Doctor_Spy')
      break
    case 'ENT':
        formattedName = formattedName.replace('_(1)', '%2C_Part_I')
          .replace('_(2)', '%2C_Part_II')
          .replace(/Bow.*/, 'Bow')
          .replace(/Shockwave%2C_Part_I$/, 'Shockwave')
          .replace(/Darkly%2C_Part_I$/, 'Darkly')
          .replace(/Front%2C_Part_I$/, 'Front')
          .replace('are_the_V', 'Are_the_V')
      break
    case 'DIS':
        formattedName = formattedName.replace('the_War', 'The_War')
          .replace('Sounds', 'Sound')
      break
    default: 
      break
  }
  
  /*
  if (name === 'Déjà Q') {
    formattedName = 'Deja_Q' // TNG 3x13
  } else {
    formattedName = encodeURIComponent(name.replace(/ /g, '_'))
    .replace(/Farpoint%2C_Part_I/, 'Farpoint') // TNG 1x01/02
    .replace(/Both_Worlds%2C_Part_I$/, 'Both_Worlds') // TNG 3x26
    .replace(/Redemption%2C_Part_I$/, 'Redemption') // TNG 4x26
    .replace(/Redemption%2C_Part_II$/, 'Redemption_II') // TNG 5x01
    .replace(/Unification%2C_Part_I$/, 'Unification_I') // TNG 5x07
    .replace(/Unification%2C_Part_II$/, 'Unification_II') // TNG 5x08
    .replace('I%2C_B', 'I_B') // TNG 5x23
    .replace(/Arrow%2C_Part_I$/, 'Arrow') // TNG 5x26
    .replace(/Descent%2C_Part_I$/, 'Descent') // TNG 6x26
    .replace(/Things...%2C_Part_I/, 'Things...') // TNG 1x01/02
  }
  */

  return memoryAlphaBaseUrl.replace('NAME', formattedName) 
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

  allEps[s] = await getSeriesData(fullUrl, s)
})

setTimeout(() => {
  write(allEps)
}, 1000)
