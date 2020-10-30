import './movielist.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
 

if(Meteor.isClient){  
  // Setting up some state for the application
  Session.set('searchQuery', '')
  Session.set('offset', 0)
  Session.set('sortedBy', {
    title: 'title',
    locations: false,
    release_year: false,
  })

  // Page handlers
  Session.set('next', true)
  Session.set('prev', false)


  // Grabbing the getMovies function from the server side.
  apiCall('title')

  Template.body.helpers({
    movies: () => {
      return Session.get('movies')
    },
    nextPage: () => {
      return Session.get('next')
    },
    prevPage: () => {
      return Session.get('prev')
    }

  })
  
  Template.body.events({
    // Searchbar
    // Each key press will search for a result.
    'keyup .searchbar': (event) => {
      const query = event.target.value.toLowerCase()
      const sort = getSort(Session.get('sortedBy'))
      Session.set('searchQuery', query)
      Session.set('offset', 0)
      apiCall(sort)

    },

    // Grabs the next 25 movies
    'click .next': () => {
      Session.set('prev', true)
      const sort = getSort(Session.get('sortedBy'))
      let offset = Session.get('offset') + 25

      Meteor.call('getMovies', sort, offset, Session.get('searchQuery'), Session.get('searchQuery'), (err, res) => {
        if(err) {
          console.log('error', err)
        };
    
        // Generating google map links for each movie
        res.data.forEach(movie => {
            mapLinkGenerator(movie)
            if(movie.locations === undefined){
              movie.locations = ''
            }
          })

        if(res.data.length > 0){
          // Checking if next button should be rendered
          if(res.data.length < 25){
            Session.set('next', false)
          }
          // Initializing movies
          Session.set('movies', res.data)
          Session.set('offset', offset)
        } else {
          offset -= 25
          Session.set('offset',offset)
          Session.set('next', false)
        }
      })
    },


    // Grabs the last 25 movies
    'click .prev': () => {
      Session.set('next', true)
      const sort = getSort(Session.get('sortedBy'))
      let offset = Session.get('offset')

      if(offset > 0){
        offset -= 25
        Session.set('offset', offset)
      }

      // Checking if next button should be rendered
      if(offset === 0){
        Session.set('prev', false)
      }

      Meteor.call('getMovies', sort, offset, Session.get('searchQuery'), (err, res) => {
        if(err) {
          console.log('error', err)
        };
        // Generating google map links for each movie
        res.data.forEach(movie => {
            mapLinkGenerator(movie)
            if(movie.locations === undefined){
              movie.locations = ''
            }
          })
        
        // Initializing movies
        Session.set('movies', res.data)
      })
    },


    // Sort Year click handler
    'click .sortYear': () => {
      const sortedBy = {
        title: false,
        release_year: 'release_year',
        locations: false,
      }
      Session.set('offset', 0)
      Session.set('sortedBy', sortedBy)
      apiCall(sortedBy.release_year)
    },    


    // Sort Title click handler
    'click .sortTitle': () => {
      const sortedBy = {
        title: 'title',
        release_year: false,
        locations: false
      }
      Session.set('offset', 0)
      Session.set('sortedBy', sortedBy)
      apiCall(sortedBy.title)
    },
    
    
    // Sort Locations click handler
    'click .sortLocation': () => {
      const sortedBy = {
        title: false,
        release_year: false,
        locations: 'locations'
      }

      // const offset = Session.get('offset')
      Session.set('offset', 0)
      Session.set('sortedBy', sortedBy)
      apiCall(sortedBy.locations)
    },    
  })
}



//////////////////
// MY FUNCTIONS //
//////////////////


// Function to generate a google page with location of movie
function mapLinkGenerator(movie) {
  return movie.href = `https://www.google.com/maps/search/?api=1&query=${movie.locations}+San+Francisco+CA`
}

// Function that sorts through the sortedBy OBJ and returns the current truthy value
function getSort(obj){
  for(let i in obj){
    if(obj[i] !== false){
      return obj[i]
    }
  }
}

// Dynamic query function that allows you to pull specific information from the database, uses state set from Session.
function apiCall(sortedBy){
  Meteor.call('getMovies', sortedBy, Session.get('offset'), Session.get('searchQuery'), (err, res) => {
    if(err) {
      console.log('error', err)
    };
    if(res.data.length > 1){
      if(res.data.length < 25){
        Session.set('next', false)
      } else if(res.data.length === 25) {
        Session.set('next', true)
      }

      // Generating google map links for each movie
      res.data.forEach(movie => {
        mapLinkGenerator(movie)
        if(movie.locations === undefined){
          movie.locations = ''
        }
      })
    }
    
    // Initializing movies
    Session.set('movies', res.data)
  })
}
