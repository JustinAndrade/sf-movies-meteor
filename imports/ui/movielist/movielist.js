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
    var myList = [];
    let count = 0

    res.data.forEach(movie => {
      // Setting the movies to the 25 length list
        if(count >= 25){
          // stopping loop once list is built
          return 
        }
        // Generates Links based on locations
        mapLinkGenerator(movie)

        // Creating MovieList to display on client
        myList.push(movie)
        count++
        console.log(myList)
      })
    Session.set('cachedMovies', res.data) // Cached List - used for "more button"
    Session.set('movies', myList) // Original List
    setTimeout(() =>Session.set('baseList', myList), 3000) // Base List to continue to pull from if query deleted.

    // Start and End count for pagination
    Session.set('start', 0)
    Session.set('end', 25)
  })

  Template.body.helpers({
    isLoading: () => {
      if(Session.get('movies')){
        return true
      } else {
        return false
      }
    },

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
      const query = event.target.value
      Meteor.call('searchMovies', [query], (err, res) => {
        if(err){
          console.log(err)
        }
        let queriedList = []
        let count = 0
        res.data.forEach(movie => {
          if(count >= 25){
            // stopping loop once list is built
            return 
          }
          // Setting the movies to the 25 length list
          mapLinkGenerator(movie)
          queriedList.push(movie)
          count++
        })
      
      if(query === ""){
        // If no query showcase default list.
        const baseList = Session.get('baseList')
        Session.set('movies', baseList)
      } else {
        // else showcase queried results
        Session.set('movies', queriedList)
      }
      })
    },

    // Grabs the next 25 movies in the cache
    'click .next': (event) => {
      const movieList = Session.get('cachedMovies')
      const copyList = movieList
      let start = Session.get('start')
      let end = Session.get('end')
      Session.set('start', start += 25)
      Session.set('end', end +=25)
      let myList = copyList.slice(start,end)
      for(let movie of copyList){
        mapLinkGenerator(movie)
      }
      Session.set('movies',myList)
    },
    // Grabs the last 25 movies in the cache
    'click .prev': (event) => {
      const movieList = Session.get('cachedMovies')
      const copyList = movieList
      let start = Session.get('start')
      let end = Session.get('end')
      Session.set('start', start -= 25)
      Session.set('end', end -=25)
      let myList = copyList.slice(start,end)
      for(let movie of copyList){
        mapLinkGenerator(movie)
      }
      Session.set('movies',myList)
    },


    // Sorting event handlers, I wasn't sure to create a helper function..  Since they are one liners I assumed this was fine.
    // ->
    'click .sortYear': (list) => {
      let myList = Session.get('movies')
      myList.sort((a,b) => a.release_year > b.release_year ? 1 : b.release_year > a.release_year ? -1 : 0)
      Session.set('movies', myList)
    },
    'click .sortTitle': (list) => {
      let myList = Session.get('movies')
      myList.sort((a,b) => a.title > b.title ? 1 : b.title > a.title ? -1 : 0)
      Session.set('movies', myList)
    },
    'click .sortLocation': (list) => {
      let myList = Session.get('movies')
      myList.sort((a,b) => a.locations > b.locations ? 1 : b.locations > a.locations ? -1 : 0)
      Session.set('movies', myList)
    },    
    // ->

  })
}


// Function to generate a google page with location of movie
const mapLinkGenerator = (movie) => {
  return movie.href = `https://www.google.com/maps/search/?api=1&query=${movie.locations}+San+Francisco+CA`
}
