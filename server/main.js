import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor' 


// Fetching Books from third party API
if(Meteor.isServer){
    // Will run on inital load
  Meteor.startup(function() {
    Meteor.methods({
        // method to request movies
      getMovies: function() {
        result = HTTP.get('https://data.sfgov.org/resource/wwmu-gmzc.json')
        return result
      },
      // method to search movies
      searchMovies: function(query){
          result = HTTP.get(`https://data.sfgov.org/resource/yitu-d5am.json?title=${query}`)
          return result
      }
    })
  })
}