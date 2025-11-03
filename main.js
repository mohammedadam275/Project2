// API key for accessing Giphy service
const API_KEY = "4M7MoBOsWE3EncxphZbI9UVQWnAAXTof";

// Number of GIFs to show per page
const PAGE_SIZE = 10;

// Tracks current position in search results for pagination
let offset = 0;

// Current active view
let currentView = "home";

// Store the current search term
let currentSearchTerm = "";

// FUNCTION: initializeApp
// WHAT IT DOES: Sets up the application when page loads
// HOW IT WORKS:
// 1. Adds event listeners to navigation buttons
// 2. Sets up form submission handler
// 3. Shows the home view by default
function initializeApp() {
    console.log("Initializing Giphy Search App");
    
    // Navigation event listeners
    document.getElementById('logo-btn').addEventListener('click', resetAndShowHome);
    document.getElementById('nav-home').addEventListener('click', resetAndShowHome);
    document.getElementById('nav-random').addEventListener('click', showRandomView);
    document.getElementById('nav-contact').addEventListener('click', showContactView);
    
    // Search form submission
    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();
        handleClickSingle();
    });
    
    // Contact form submission
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        handleContactSubmit();
    });
 // Show home view by default
    resetAndShowHome();
}

// FUNCTION: resetAndShowHome
// WHAT IT DOES: Resets the home page and shows it
// HOW IT WORKS:
// 1. Clears any previous search results
// 2. Resets search input field
// 3. Resets pagination
// 4. Shows the home view with default state
function resetAndShowHome() {
    hideAllViews();
    document.getElementById('view-home').classList.remove('hidden');
    currentView = "home";
    
    // Reset everything to initial state
    offset = 0;
    currentSearchTerm = "";
    document.getElementById('search-input').value = "";
    document.getElementById('home-results').innerHTML = "";
}
// FUNCTION: showHomeView
// WHAT IT DOES: Shows the home/search view WITHOUT resetting (for pagination)
// HOW IT WORKS:
// 1. Hides all views
// 2. Shows only the home view
// 3. Keeps current search results intact
function showHomeView() {
    hideAllViews();
    document.getElementById('view-home').classList.remove('hidden');
    currentView = "home";
}
// FUNCTION: showRandomView
// WHAT IT DOES: Shows the random GIFs view
// HOW IT WORKS:
// 1. Hides all views
// 2. Shows the random view
// 3. Loads random GIFs
function showRandomView() {
    hideAllViews();
    document.getElementById('view-random').classList.remove('hidden');
    currentView = "random";
    loadRandomGifs();
}

// FUNCTION: showContactView
// WHAT IT DOES: Shows the contact form view
// HOW IT WORKS:
// 1. Hides all views
// 2. Shows the contact view
function showContactView() {
    hideAllViews();
    document.getElementById('view-contact').classList.remove('hidden');
    currentView = "contact";
}
// FUNCTION: hideAllViews
// WHAT IT DOES: Hides all main content views
// HOW IT WORKS:
// 1. Adds 'hidden' class to all view sections
function hideAllViews() {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-random').classList.add('hidden');
    document.getElementById('view-contact').classList.add('hidden');
}

// FUNCTION: prevPage
// WHAT IT DOES: Goes to the previous page of GIF results (ONLY FOR HOME/SEARCH VIEW)
// HOW IT WORKS: 
// 1. Checks if we're not already on the first page
// 2. If not, moves back by PAGE_SIZE in the results
// 3. Calls the search function to update the display
function prevPage() {
    if (offset >= PAGE_SIZE) {
        offset -= PAGE_SIZE;
        handleClickSingle();
    }
}
// FUNCTION: nextPage
// WHAT IT DOES: Goes to the next page of GIF results (ONLY FOR HOME/SEARCH VIEW)
// HOW IT WORKS:
// 1. Moves forward by PAGE_SIZE in the results
// 2. Calls the search function to update the display
function nextPage() {
    offset += PAGE_SIZE;
    handleClickSingle();
}

// FUNCTION: handleClickSingle
// WHAT IT DOES: Searches for GIFs and displays them on the page (MAIN SEARCH FUNCTION)
// HOW IT WORKS:
// 1. Gets the search term from the input field
// 2. Stores the search term for pagination
// 3. Builds the API request URL with all parameters
// 4. Sends request to Giphy API
// 5. Processes the response and creates HTML to display GIFs
// 6. Shows the GIFs in the home results area with pagination
function handleClickSingle() {
    console.log("handleClickSingle called");   
    const elementOutputArea = document.getElementById("home-results");
    const search = document.getElementById("search-input").value;
    
    // Store the current search term for pagination
    currentSearchTerm = search;
    
    // If no search term, show message
    if (!search) {
        elementOutputArea.innerHTML = "<p>Please enter a search term</p>";
        return;
    }
    
    let url = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${search}&limit=${PAGE_SIZE}&offset=${offset}`;
    console.log('url=' + url);
    
    // Show loading state
    elementOutputArea.innerHTML = "<p>Loading GIFs...</p>";
    
    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            console.log(json);
            const gifs = json.data;
            
            // Check if no results found
            if (gifs.length === 0) {
                elementOutputArea.innerHTML = "<p>No GIFs found. Try a different search term.</p>";
                return;
            }
            
            let s = "";
            for (let gif of gifs) {
                let title = gif.title || "Untitled GIF";
                let gifUrl = gif.images.fixed_height.url;
                let originalUrl = gif.url;
                
                s += `<div class="flex-item">
                         <div class="gif-card">
                             <a href="${originalUrl}" target="_blank">
                                 <img src="${gifUrl}" alt="${title}">
                             </a>
                             <div>${title}</div>
                         </div>
                      </div>`;
            }
            // Add pagination buttons
            s += `<div class="pagination" style="flex-basis: 100%; text-align: center; margin-top: 2rem;">
                    <button type="button" onclick="prevPage()">&lt; Previous</button>
                    <button type="button" onclick="nextPage()">Next &gt;</button>
                  </div>`;
            
            console.log(s);
            elementOutputArea.innerHTML = s;
        })
        .catch((error) => {
            console.error('Error:', error);
            elementOutputArea.innerHTML = "<p>Error loading GIFs. Please try again.</p>";
        });
}
// FUNCTION: loadRandomGifs
// WHAT IT DOES: Loads and displays random GIFs
// HOW IT WORKS:
// 1. Uses Giphy's random endpoint multiple times
// 2. Displays each random GIF in the random results area
function loadRandomGifs() {
    const elementOutputArea = document.getElementById("random-results");
    elementOutputArea.innerHTML = "<p>Loading random GIFs...</p>";
    
    let s = "";
    let requests = [];
    
    // Create multiple requests for random GIFs
    for (let i = 0; i < 6; i++) {
        let url = `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}`;
        requests.push(
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    let gif = json.data;
                    let title = gif.title || "Random GIF";
                    let gifUrl = gif.images.fixed_height.url;
                    let originalUrl = gif.url;
                    
                    return `<div class="flex-item">
                               <div class="gif-card">
                                   <a href="${originalUrl}" target="_blank">
                                       <img src="${gifUrl}" alt="${title}">
                                   </a>
                                   <div>${title}</div>
                               </div>
                            </div>`;
                })
                .catch(error => {
                    console.error('Error loading random GIF:', error);
                    return `<div class="flex-item"><p>Error loading GIF</p></div>`;
                })
        );
    }
    
    // Wait for all requests to complete
    Promise.all(requests)
        .then(results => {
            s = results.join('');
            elementOutputArea.innerHTML = s;
        });
}

// FUNCTION: handleContactSubmit
// WHAT IT DOES: Handles contact form submission
// HOW IT WORKS:
// 1. Gets form values
// 2. Shows success message (in real app, would send to server)
// 3. Resets the form
function handleContactSubmit() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const reason = document.getElementById('contact-reason').value;
    const feedback = document.getElementById('contact-feedback');
    
    // Simulate form submission
    feedback.innerHTML = `<p class="success">Thank you, ${name}! Your message has been sent. We'll get back to you at ${email} soon.</p>`;
    
    // Reset form
    document.getElementById('contact-form').reset();
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initializeApp);


