import YoutubePodcast from './youtubePodcast.js';
import express from 'express';
import log from './log.js';
import config from './config.js';

const PORT = config.port;
let app = express();

app.get('*', function(req, res)
{
	let channelID = req.query.channelID;
	let youtubePodcast = new YoutubePodcast(channelID);

	youtubePodcast.promise.then(
	function(podcast)
	{
		res.send(podcast.getXML());
	},
	function(error)
	{
		log.error(JSON.stringify(error));
		res.send(JSON.stringify(error));
	});
});

app.listen(PORT, function()
{
	log.success('Server listening on port ' + PORT);
});