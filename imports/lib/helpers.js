import { Session } from "meteor/session";


// Function that sorts through the sortedBy OBJ and returns the current truthy value
export function getSort(obj) {
    for (let i in obj) {
        if (obj[i] !== false) {
            return obj[i];
        }
    }
}

// Handles the offset to move through pages.
export function pageHandler(offset, command) {
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
export function apiCall(sortedBy) {
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
            } else if (res.data.length >= 1) {
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
    
    // Function to generate a google maps link corresponding to where the film was filmed.
    function mapLinkGenerator(movie) {
        return (movie.href = `https://www.google.com/maps/search/?api=1&query=${movie.locations}+San+Francisco+CA`);
    }