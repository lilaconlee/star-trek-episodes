const series = [
  'TOS',
  'TAS',
  'TNG',
  'DS9',
  'VOY',
  'ENT',
  'DIS'
] 

describe('test output', () => {
  it('includes all series', () => {
    cy.readFile('episodes.json').then((data) => {
      expect(data).to.have.all.keys(...series)
    })
  })

  it('entries are correctly formatted, with working URL', () => {
    cy.readFile('episodes.json').then((data) => {
      series.forEach((s) => {
        const eps = data[s]

        eps.forEach((ep) => {
          expect(ep).to.have.all.keys('name', 'season', 'number', 'summary', 'url')
          cy.request(ep.url)
        })
      })
    })
  })
})
