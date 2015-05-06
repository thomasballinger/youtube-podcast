import colors from 'colors';

export default {
	success: function()
	{
		var message = [].join.call(arguments, ' ');
		console.log(message.bold.green);
	},
	error: function()
	{
		var message = [].join.call(arguments, ' ');
		console.log(message.bold.red);
	}
}