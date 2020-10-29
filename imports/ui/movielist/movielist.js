import './movielist.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
 

if(Meteor.isClient){  
  // Grabbing the getMovies function from the server side.
  Meteor.call('getMovies', (err, res) => {
    if(err) {
      console.log('error', err)
    };

    // initializing list to hold 25 movies
    res.data.forEach(movie => {
        mapLinkGenerator(movie)
        if(movie.locations === undefined){
          movie.locations = ''
        }
      })
    
    // Initializing movies
    const myList = setList(res.data)

    // Setting sessions for movies
    Session.set('cachedMovies', res.data) // Cached List - used for "next and prev buttons"  * Might only need one of these
    Session.set('baseList', myList) // Base List to continue to pull from if query deleted.

    // Start and End count for pagination
    Session.set('start', 0)
    Session.set('end', 25)
  })

  Template.body.helpers({
    movies: () => {
      return Session.get('movies')
    },
    nextPage: () => {
      if(Session.get('end') < 1000){
        return true
      }
    },
    prevPage: () => {
      if(Session.get('end') > 25){
        return true
      }
    }

  })
  
  Template.body.events({
    // Searchbar
    // Each key press will search for a result.
    'keyup .searchbar': (event) => {
      const query = event.target.value.toLowerCase()

      // Pulling the cached movies to query
      let myList = Session.get('cachedMovies')
      // Filtering the movies based query
      // Filter by year if year typed in
      myList = myList.filter(movie =>  movie.release_year == query)
      // If no year priortize title
      if(myList.length < 1){
        myList = Session.get('cachedMovies')
        myList = myList.filter(movie =>  {
          const title = movie.title.toLowerCase()
          return title.includes(query) && title >= query && title[0] === query[0]
        })
      }
      // Setting the list of queried movies
      setList(myList)
      if(query === "") {
        // If no query showcase default list.
        const baseList = Session.get('baseList')
        Session.set('movies', baseList)
      }
    },

    // Grabs the next 25 movies in the cache
    'click .next': () => {
      const movieList = Session.get('cachedMovies')
      const copyList = movieList
      let start = Session.get('start')
      let end = Session.get('end')
      Session.set('start', start += 25)
      Session.set('end', end +=25)
      let myList = copyList.slice(start,end)
      Session.set('movies',myList)
    },
    // Grabs the last 25 movies in the cache
    'click .prev': () => {
      const movieList = Session.get('cachedMovies')
      const copyList = movieList
      let start = Session.get('start')
      let end = Session.get('end')
      Session.set('start', start -= 25)
      Session.set('end', end -=25)
      let myList = copyList.slice(start,end)
      Session.set('movies',myList)
    },


    // Sorting event handlers, I wasn't sure to create a helper function..  Since they are one liners I assumed this was fine.
    // ->
    'click .sortYear': () => {
      let myList = Session.get('cachedMovies')
      sortArr(myList, 'release_year')
      Session.set('cachedMovies', myList)
      setList(myList)
    },
    'click .sortTitle': () => {
      let myList = Session.get('cachedMovies')
      sortArr(myList, 'title')
      Session.set('cachedMovies', myList)
      setList(myList)
    },
    'click .sortLocation': () => {
      let myList = Session.get('cachedMovies')
      console.log(myList)
      sortArr(myList, 'locations')
      Session.set('cachedMovies', myList)
      setList(myList)
    },    
    // ->

  })
}



//////////////////
// MY FUNCTIONS //
//////////////////


// Function to generate a google page with location of movie
const mapLinkGenerator = (movie) => {
  return movie.href = `https://www.google.com/maps/search/?api=1&query=${movie.locations}+San+Francisco+CA`
}

// Function to sort movies
const sortArr = (arr, property) => {
  let newArr = arr;
  newArr.sort((a,b) => a[property] > b[property] ? 1 : b[property] > a[property] ? -1 : 0)
  return newArr
}

// Setting list to the movies
const setList = (arr) => {
  let start = 0
  let end = 25
  Session.set('start', start)
  Session.set('end', end)
  let newArr = arr
  newArr = newArr.slice(start, end)
  return Session.set('movies', newArr)
}
