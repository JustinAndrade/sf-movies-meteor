import '../imports/lib/routes.js'
import './layouts/MoviesLayout.html'

import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";

import { apiCall, getSort, pageHandler } from '../imports/lib/helpers.js'

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

  Template.MoviesLayout.helpers({
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

  Template.MoviesLayout.events({
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

