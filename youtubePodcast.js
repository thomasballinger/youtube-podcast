import log from './log.js';
import ytdl from 'ytdl-core';
import q from 'q';
import request from 'request';
import xml2js from 'xml2js';
import Podcast from './podcast.js';
import config from './config.js';

const YOUTUBE_API_KEY		= config.youtube_api_key;
const YOUTUBE_CHANNEL_URL	= 'https://www.googleapis.com/youtube/v3/channels?part=snippet&id={channelID}&key=' + YOUTUBE_API_KEY;
const YOUTUBE_FEED_URL		= 'https://www.youtube.com/feeds/videos.xml?channel_id={channelID}';

function req(url)
{
	let def = q.defer();

	request(url, (error, response, body) =>
	{
		if(error)
		{
			def.reject(error);
		}
		else
		{
			if(response.statusCode == 200)
			{
				def.resolve(body);
			}
			else
			{
				def.reject('An error occured happend while loading ' + url);
			}
		}
	});

	return def.promise;
}

export default class YoutubePodcast
{
	constructor(channelID)
	{
		this.channelID = channelID;
		this.def = q.defer();
		this.promise = this.def.promise;

		this.getChannelInfo()
			.then(this.onChannelInfoReceived.bind(this))
			.then(this.getYoutubeFeed.bind(this))
			.then(this.onYoutubeFeedReceived.bind(this))
			.then(this.generatePodcastFeed.bind(this))
			.then(this.onPodcastFeedGenerated.bind(this))
			.then(null, this.onError.bind(this));
	}
	onError(error)
	{
		this.def.reject(error);
	}
	buildItem(rawEntry)
	{
		let def = q.defer();
		let entry = {};

		entry.id			= rawEntry['yt:videoId'][0];
		entry.title			= rawEntry['title'][0];
		entry.description	= rawEntry['media:group'][0]['media:description'][0];
		entry.url			= rawEntry['link'][0]['$']['href'];
		entry.thumbnail		= rawEntry['media:group'][0]['media:thumbnail'][0]['$']['url'];
		entry.published		= rawEntry['published'][0];

		log.success('Getting info for video ' + entry.id);

		ytdl.getInfo(entry.url, { downloadURL: true }, function(err, videoInfo)
		{
			entry.downloadURL	= videoInfo.formats[0].url;
			entry.duration		= videoInfo.length_seconds;
			entry.length		= 0;
			entry.type			= videoInfo.formats[0].type;

			def.resolve(entry);
		});

		return def.promise;
	}
	getChannelInfo()
	{
		log.success('Getting info for channel ' + this.channelID);

		let url = YOUTUBE_CHANNEL_URL.replace(/{channelID}/g, this.channelID);

		return req(url).then(function(result)
		{
			return JSON.parse(result).items[0].snippet;
		});
	}
	onChannelInfoReceived(channelInfo)
	{
		let info = {};

		info.title			= channelInfo.title;
		info.authorName		= channelInfo.title;
		info.authorEmail	= 'null@null.null';
		info.site			= 'https://www.youtube.com/channel/' + this.channelID;
		info.description	= channelInfo.description;
		info.pubDate		= channelInfo.publishedAt;
		info.thumbnail		= channelInfo.thumbnails.medium.url;

		this.info = info;

		return null;
	}
	getYoutubeFeed()
	{
		log.success('Getting feed for channel ' + this.channelID);

		let url = YOUTUBE_FEED_URL.replace(/{channelID}/g, this.channelID);
		let def = q.defer();

		req(url).then(function(result)
		{
			xml2js.parseString(result, function(error, result)
			{
				if(error)
				{
					def.reject(error);
				}
				else
				{
					def.resolve(result.feed);
				}
			});
		});

		return def.promise;
	}
	onYoutubeFeedReceived(feed)
	{
		return feed.entry;
	}
	generatePodcastFeed(entries)
	{
		let podcast = new Podcast(this.info);
		
		let promises = entries.map(rawEntry =>
		{
			return this.buildItem(rawEntry);
		});

		// let promises = [this.buildItem(entries[0])];

		return q.allSettled(promises).then(function(results)
		{
			results.forEach(function (result)
			{
				if(result.state === "fulfilled")
				{
					podcast.push(result.value);
				}
			});

			return podcast;
		});
	}
	onPodcastFeedGenerated(podcast)
	{
		this.def.resolve(podcast);
		return null;
	}
}