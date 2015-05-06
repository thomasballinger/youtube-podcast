import xml2js from 'xml2js';
import moment from 'moment';

function formatDuration(duration)
{
	var sec_num = parseInt(duration, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function formatType(str)
{
	return str.split(';')[0];
}

export default class Podcast
{
	constructor(info)
	{
		this.info = info;

		// info.title		
		// info.authorName	
		// info.authorEmail
		// info.site		
		// info.description
		// info.pubDate	
		// info.thumbnail	

		this.rss = {
			"$":
			{
				"xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
				"version": "2.0",
				"xmlns:atom": "http://www.w3.org/2005/Atom"
			},
			"channel": [
			{
				"atom:link": [
				{
					"$":
					{
						"rel": "self",
						"type": "application/rss+xml",
						"href": info.site
					}
				}],
				"lastBuildDate": [info.pubDate],
				"title": [info.title],
				"itunes:author": [info.authorName],
				"link": [info.site],
				// "generator": [
				// 	"Podcast Maker v1.4.0 - http://www.lemonzdream.com/podcastmaker"
				// ],
				"description": [info.description],
				"itunes:subtitle": [info.description.substr(0,100) + '...'],
				"itunes:summary": [info.description],
				"language": ["en"],
				// "copyright": ["© Marvel"],
				"itunes:owner": [
				{
					"itunes:name": [info.authorName],
					"itunes:email": [info.authorEmail]
				}],
				"image": [
				{
					"url": [info.thumbnail],
					"title": [info.title],
					"link": [info.site],
					// "width": [
					// 	"144"
					// ],
					// "height": [
					// 	"144"
					// ]
				}],
				"itunes:image": [
				{
					"$":
					{
						"href": info.thumbnail
					}
				}],
				"category": [
					"TV & Film",
					"Podcasting"
				],
				"itunes:category": [
				{
					"$":
					{
						"text": "TV & Film"
					}
				},
				{
					"$":
					{
						"text": "Technology"
					},
					"itunes:category": [
					{
						"$":
						{
							"text": "Podcasting"
						}
					}]
				}],
				// "itunes:keywords": [
				// 	"Avengers, Iron Man, Hulk, Captain America, Black Widow, Thor"
				// ],
				"itunes:explicit": [
					"no"
				],
				item: []
			}]
		};
	}
	push(entry)
	{
		this.rss.channel[0].item.push(
		{
			"title": [entry.title],
			"itunes:author": [this.info.authorName],
			"description": [entry.description],
			"itunes:subtitle": [entry.description.substr(0, 100) + '...'],
			"itunes:summary": [''],
			"enclosure": [
			{
				"$":
				{
					"url": entry.downloadURL,
					"type": formatType(entry.type),
					"length": entry.length
				}
			}],
			"guid": [entry.downloadURL],
			"pubDate": [moment(entry.published).format('ddd, D MMM YYYY hh:mm:ss ZZ')],//'Tue, 21 Apr 2015 15:50:25 +0200'
			"category": ["TV & Film"],
			"itunes:explicit": ["no"],
			"itunes:duration": [formatDuration(entry.duration)],
			"itunes:keywords": ['YouTube']
		});

		// entry.id			
		// entry.title			
		// entry.description
		// entry.url			
		// entry.thumbnail		
		// entry.duration		
		// entry.published		
		// entry.downloadURL

		// this.rss.channel[0].item.push(
		// {
		// 	"title": [entry.title],
		// 	"itunes:author": [this.info.authorName],
		// 	"description": [entry.description],
		// 	"itunes:subtitle": [entry.description.substr(0,100) + '...'],
		// 	"itunes:summary": [''],
		// 	"enclosure": [
  //             {
  //               "$": {
  //                 "url": "http://marvel.cdn.stream-ag.de/podcast/AAOU/AAOU_03_Videos_Filmclip_Hammer-podcast_1080p.mp4",
  //                 "type": "video/mp4",
  //                 "length": "114567761"
  //               }
  //             }
  //           ],
		// 	"guid": [entry.downloadURL],
		// 	"pubDate": [entry.published],
		// 	"category": [
		// 		"TV & Film"
		// 	],
		// 	"itunes:explicit": [
		// 		"no"
		// 	],
		// 	"itunes:duration": [
		// 		"00:00:00"
		// 	],
		// 	"itunes:keywords": [
		// 		"Avengers, Iron Man, Hulk, Captain America, Black Widow, Thor"
		// 	]
		// });

		// this.feed.item(
		// {
		// 	title: entry.title,
		// 	description: entry.description,
		// 	url: entry.url, // link to the item
		// 	//guid: '1123', // optional - defaults to url
		// 	//categories: ['TV & Film'], // optional - array of item categories
		// 	//author: 'Guest Author', // optional - defaults to feed author property
		// 	date: entry.published, // any format that js Date can parse.
		// 	//lat: 33.417974, //optional latitude field for GeoRSS
		// 	//long: -111.933231, //optional longitude field for GeoRSS
		// 	enclosure:
		// 	{
		// 		url: entry.downloadURL
		// 		// file: 'path-to-file'
		// 	}, // optional enclosure
		// 	custom_elements:
		// 	[
		// 		{
		// 			'itunes:author': this.info.authorName
		// 		},
		// 		{
		// 			'itunes:subtitle': entry.description.substr(0, 100) + '...'
		// 		},
		// 		{
		// 			'itunes:image':
		// 			{
		// 				_attr:
		// 				{
		// 					href: entry.thumbnail
		// 				}
		// 			}
		// 		},
		// 		{
		// 			'itunes:duration': entry.duration
		// 		}
		// 	]
		// });
	}
	getXML()
	{
		var builder = new xml2js.Builder();
		return builder.buildObject({ rss: this.rss });
	}
}