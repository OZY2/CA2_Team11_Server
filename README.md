I made 2 web service and it functions so that when one of it is down it will start the other one i use both aiven and filess.io then i render them seperately

the server.js has routes for appget /allrecyclables which takes all the data from the table recyclables
appget /recyclable/:id which gets recyclable by specific id
app.post /addrecyclable which adds recyclables
