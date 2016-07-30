from bs4 import BeautifulSoup
import json
import os
import urllib
import urllib2
import wikipedia

BASE_URL = "https://en.wikipedia.org"
series = ["The Original Series", "The Next Generation", "Deep Space Nine", "Voyager", "Enterprise"]

for s in series:
    filename = s.lower().replace(' ', '') + ".json"
    episodes = []

    page = wikipedia.page("List of Star Trek: " + s + " episodes")
    episodesUrl = page.url
    res = urllib2.urlopen(episodesUrl)
    html = res.read()
    soup = BeautifulSoup(html, "lxml")
    for title in soup.select('td[class="summary"]'):
        try:
            url = BASE_URL + title.a["href"]
        except TypeError:
            url = episodesUrl
        episode = {
            'title': title.text.replace('"', ''),
            'url': url
        }
        episodes.append(json.dumps(episode))
        with open(filename, 'a') as f:
            json.dump(episode, f)
            f.write(',')
            f.write(os.linesep)
