var yelp = require("yelp").createClient({
  consumer_key: "ZJ04kC70PhVlktFnTYDwBQ", 
  consumer_secret: "TcZ6jMoGNNuaPgYaiuVATEgWsN4",
  token: "-awaXhCaBNTCwq1cDJDx5EIPzHHZQw_O",
  token_secret: "SrdK7N9wz5dWExX-HsVEYL3yzuk"
});
 
// See http://www.yelp.com/developers/documentation/v2/search_api 
yelp.search({term: "food", location: "Montreal"}, function(error, data, callback) {
	if(error){
		console.log("Error", error);
	}
  console.log(data);
});

// See http://www.yelp.com/developers/documentation/v2/business 
// yelp.business("yelp-san-francisco", function(error, data) {
// 	if(error){
//   		console.log("Error", error);
// 	}
//   console.log(data);
// });