import { HTTP } from "meteor/http";
import { Meteor } from "meteor/meteor";

// Fetching Books from third party API
if (Meteor.isServer) {
  // Will run on inital load
  Meteor.startup(function () {
    Meteor.methods({
      // method to request movies based on sorting, page, and possible query
      getMovies: function (sortedBy, offset, query) {
        let result = "";
        if (query) {
          result = HTTP.get(
            `https://data.sfgov.org/resource/wwmu-gmzc.json?$query=SELECT * WHERE starts_with(lower(title), '${query}') ORDER BY ${sortedBy} LIMIT 25 OFFSET ${offset}`
          );
          if (result.data.length === 0) {
            result = HTTP.get(
              `https://data.sfgov.org/resource/wwmu-gmzc.json?$where=release_year = ${Number(
                query
              )} LIMIT 25`
            );
          }
          return result;
        } else {
          result = HTTP.get(
            `https://data.sfgov.org/resource/wwmu-gmzc.json?$order=${sortedBy} asc LIMIT 25 OFFSET ${offset.toString()}`
          );
          return result;
        }
      },
    });
  });
}
