import "./movielist.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";

if (Meteor.isClient) {
  // Setting up state for the application
  // -> FROM HERE DOWN <- //
  Session.set("searchQuery", "");
  Session.set("offset", 0);
  Session.set("sortedBy", {
    title: "title",
    locations: false,
    release_year: false,
  });

  // Page handlers
  Session.set("next", true);
  Session.set("prev", false);
  // -> FROM HERE UP <- //

  // Grabbing the getMovies function from the server side.
  // This will sort by 'title' by default.
  apiCall("title");

  Template.body.helpers({
    movies: () => {
      return Session.get("movies");
    },
    nextPage: () => {
      return Session.get("next");
    },
    prevPage: () => {
      return Session.get("prev");
    },
  });

  Template.body.events({
    // Searchbar which render results on key press.
    "keyup .searchbar": (event) => {
      // Setting query to lowercase so it will match the server request.
      const query = event.target.value.toLowerCase();
      const sort = getSort(Session.get("sortedBy"));
      // Resetting state when searching.
      Session.set("searchQuery", query);
      Session.set("offset", 0);
      Session.set("prev", false);
      apiCall(sort);
    },

    // Grabs the next 25 movies
    "click .next": () => {
      Session.set("prev", true);
      pageHandler(Session.get("offset"), "next");
    },

    // Grabs the last 25 movies
    "click .prev": () => {
      Session.set("next", true);
      pageHandler(Session.get("offset"), "prev");
    },

    // Sort Year click handler
    "click .sortYear": () => {
      const sortedBy = {
        title: false,
        release_year: "release_year",
        locations: false,
      };
      Session.set("sortedBy", sortedBy);
      pageHandler();
      apiCall(sortedBy.release_year);
    },

    // Sort Title click handler
    "click .sortTitle": () => {
      const sortedBy = {
        title: "title",
        release_year: false,
        locations: false,
      };

      Session.set("sortedBy", sortedBy);
      pageHandler();
      apiCall(sortedBy.title);
    },

    // Sort Locations click handler
    "click .sortLocation": () => {
      const sortedBy = {
        title: false,
        release_year: false,
        locations: "locations",
      };

      Session.set("sortedBy", sortedBy);
      pageHandler();
      apiCall(sortedBy.locations);
    },
  });
}

//////////////////
// MY FUNCTIONS //
//////////////////

// Function to generate a google maps link corresponding to where the film was filmed.
function mapLinkGenerator(movie) {
  return (movie.href = `https://www.google.com/maps/search/?api=1&query=${movie.locations}+San+Francisco+CA`);
}

// Function that sorts through the sortedBy OBJ and returns the current truthy value
function getSort(obj) {
  for (let i in obj) {
    if (obj[i] !== false) {
      return obj[i];
    }
  }
}

// Handles the offset to move through pages.
function pageHandler(offset, command) {
  let newOffset = 0;
  const sort = getSort(Session.get("sortedBy"));
  // Handling if user clicks 'prev page'
  if (command === "prev") {
    if (offset > 0) {
      offset -= 25;
      Session.set("offset", offset);
    }

    // Checking if next button should be rendered
    if (offset === 0) {
      Session.set("prev", false);
    }
    apiCall(sort);
    return;

    // Handling if user clicks 'next page'
  } else if (command === "next") {
    offset += 25;
    Session.set("offset", offset);
    apiCall(sort);
  } else {
    Session.set("offset", newOffset);
    return newOffset;
  }
}

// Dynamic query function that allows you to pull specific information from the database, uses state set from Session.
// sortedBy will be 'title' by default
function apiCall(sortedBy) {
  const offset = Session.get("offset");
  Meteor.call(
    "getMovies",
    sortedBy,
    Session.get("offset"),
    Session.get("searchQuery"),
    (err, res) => {
      if (err) {
        console.log("error", err);
        // If we are receiving a list of movies run this.
      } else if (res.data.length > 1) {
        if (res.data.length < 25) {
          Session.set("next", false);
        } else if (res.data.length === 25) {
          Session.set("next", true);
        }
        // Generating google map links for each movie.
        res.data.forEach((movie) => {
          mapLinkGenerator(movie);
          if (movie.locations === undefined) {
            movie.locations = "";
          }
        });

        // Set the movies to state to render.
        Session.set("movies", res.data);
        Session.set("offset", offset);
        // If our list of movies is empty run this.
      } else {
        offset -= 25;
        Session.set("offset", offset);
        Session.set("next", false);
      }
    }
  );
}
