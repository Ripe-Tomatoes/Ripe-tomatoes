# Ripe-tomatoes
*Look in more than one basket!*

#Why Ripe Tomatoes
  1. Create awesome shit
    - Work on an app that can be used by consumers on a daily basis
    - Easy to set layerable short-term and long-term goals--very little all/nothing milestones
  2. Create that shit quickly
    - Thorough documentation and comments
    - Modularized code
    - Zhao
  3. Get better at shit
    - Wide range of challenges, from MVC and Angular to databases and tokens. APIs, callbacks/async functions. Front-end and back-end. ALGORITHMS TOO YAY

#Getting Started
We are excited that you have chosen to contribute to the Ripe Tomatoes project! Ripe Tomatoes was designed to be highly modular and easily expandable. Notable things include:
- Clearly divided client and server side code with data transactions between the two kept to a minimum
- Auto-deployment to heroku server 
- Modularized API functions to easily add additional API calls asynchronously, minimizing server time and development time

#Data flow 
Search query:
  1. User makes an inquiry for a given keyword and location
  2. Clientside sends a post request from '/search' with keyword and location to server
  3. Server processes the request and asynchronously sends out API requests to foursquare and yelp
  4. After foursquare and yelp API fetches are complete, server compares the results of the API and combines the results into one array called matchedRestaurants.
  5. Once the array is complete, server sends a Google API request for each restaurant in the array. These requests (1 per restaurant) are done async to minimize time. The restaurant array is then updated with the Google API information
  6. Server then sends the results of the search back to the client
  7. Client handles the data and renders it appropriately
  
  Relevant backend files: 
- server/server.js (starts the server and database)
- server/config/requestHandlers.js (handles requests)
- server/config/utils.js (all of the helper functions, API calls, and comparison functions)
  
  Relevant frontend files:
- client/app.js (main angular functions)
- client/searchResults.html (handles the results after server responds)

User login:
  1. User creates a new username/password
  2. Client sends information to server
  3. Server checks if username exists, adds user + encrypted/hashed pw to MongoDB. User's favorites can now be stored
  4. Token-based session created for user--user automatically signed in
  
  Relevant backend files: 
- server/server.js (starts the server and database)
- server/config/requestHandlers.js (handles requests)
- server/users/userController.js (handles all the functions related to user actions like sign-in, addFavorites, etc)
- server/users/userModel.js (defines user schema and password functions)
  
  Relevant frontend files:
- client/app.js (main angular functions)
- client/signin.html
- client/signup.html

#First steps
1. Get your own damn API keys:
  - Yelp: https://www.yelp.com/developers/documentation/v2/overview   ----> "Manage API Access"
  - Foursquare: https://developer.foursquare.com/ ----> "Get started"
  - Google Places API: https://developers.google.com/places/ 
  - Google Map API: https://developers.google.com/maps/?hl=en
2. Replace the API keys in apiKeys.js with your new keys (if the file doesn't exist, create one just like the apiKeys_example.js and rename it apiKeys.js in the same location)
3. npm install, [sudo] mongod, nodemon server/server.js
4. In browser, go to 127.0.0.1:3000
5. Follow the data flows as outlined above to understand the current structure and functions
6. Ask Zhao for any help

#Possible ideas
1. Additional APIs: OpenTable, TripAdvisor, CitySearch, Facebook places, and more!
2. User OAUTH for all APIs: let/force users to sign into their their yelp/foursquare accounts for personalized results. This lets you make API requests and have it count towards the user's API limit, and not your own. This is absolutely critical for any realistic public-release, as there's no way your own API key can handle the mass influx of requests
3. User submission of reviews on external page: Assuming user OAUTH (#2 in ideas), users can then POST reviews to 3rd party pages like Yelp/Foursquare
4. User reservations via OpenTable: There's money to be made here...
5. Preview of 3rd party reviews
6. Database to store all the restaurants: this is another way around issue raised in idea #2. Cache all restaurants found in your own database. May or may not violate some API ToS's
7. Social sharing features
8. Better results handling--what if a restaurant appears in Yelp but not in Foursquare? Could add a "no data found for x"
9. Improved restaurant matching algorithm
10. Improved API call structure
11. Improved UI

#Data structures passed around
- Client to server search request: 
```
{
  restaurant: 'restaurant name',
  location: 'location' //can be generic like "sf" or a specific address. 
}
```
- Server to client search results:
```
{
  results: arrayOfRestaurants
}
```
  If there was an error, sends back this:
```
{
  error: 'error message',
  erroCode: integerCode //ie 50
}
```
- Array of restaurants (called matchedRestaurants in server/config/utils.js):
```
[
  {
    name: 'restaurantname',
    address: 'restaurantAddress',
    url: 'restaurantURL',
    location: {
      latitute: number,
      longitude: number
    },
    yelpData: {
      rating: number,
      ratingUrl: 'link to yelp rating img',
      url: 'link to yelp restaurant page',
      reviewCount: number
    },
    foursquareData: {
      rating: number,
      url: 'link to foursquare restaurant page',
      reviewCount: number
    }
    googleData: {
      rating: number
    }
    googleFound: boolean //this is just an internal marker to check if the Google API query finishes
    totalReviews: sumOfReviewCounts
    compositeScore: secret sauce number
    phoneNumber: 'phone number',
    imageUrl: 'image url from yelp',
    priceLevel: intFrom1to4of$, //from Google data
    openNow: boolean //from Google data
  }
]
```