import { HTTP } from 'meteor/http'
import { Meteor } from 'meteor/meteor' 


// Fetching Books from third party API
if(Meteor.isServer){
  // Will run on inital load
  Meteor.startup(function() {
    Meteor.methods({
      // method to request movies based on sorting, page, and possible query
      getMovies: function(sortedBy, offset, query) {
        let result = ''
        if(query){
          if(query && sortedBy){
            result = HTTP.get(`https://data.sfgov.org/resource/wwmu-gmzc.json?$query=SELECT * WHERE starts_with(lower(title), '${query}') ORDER BY ${sortedBy} LIMIT 25 OFFSET ${offset}`)
            return result
          }
          result = HTTP.get(`https://data.sfgov.org/resource/wwmu-gmzc.json?$where=starts_with(lower(title), '${query}') LIMIT 25`)
          return result
        }
        if(sortedBy) {
          result = HTTP.get(`https://data.sfgov.org/resource/wwmu-gmzc.json?$order=${sortedBy} asc LIMIT 25 OFFSET ${offset.toString()}`)
        } else {
          result = HTTP.get(`https://data.sfgov.org/resource/wwmu-gmzc.json?$order=title asc LIMIT 25 OFFSET ${offset.toString()}`)
        }
        return result
      },
    })
  })
}