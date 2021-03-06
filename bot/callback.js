const { Markup, Extra } = require('telegraf');
const User = require('../models/user');

const { getDataDaily, getDataMonthly } = require('../date/getData');
const createChart = require('../chart/createChart');

const handleCallback = async (ctx) => {
	const [type, data] = ctx.update.callback_query.data.split('-');
	const id = ctx.update.callback_query.from.id;

	const user = await User.findOne({ id })
	try {
		if (!user || user.channels.length < 1) {
			return ctx.reply('The channel does not exist in your list.');
		}

		const index = user.channels.indexOf(data);
		if (index < 0) {
			return ctx.reply('The channel does not exist in your list.');
		}

		switch (type) {
			case 'remove':
				user.channels.splice(index, 1);
				await user.save();
				ctx.answerCallbackQuery('Removed successfully!');
				return ctx.editMessageText(`❌ The channel *${data}* has been removed from your list.`, Extra.markdown());

			case 'stats':
				return ctx.editMessageText(`How do you want to get stats?`, Markup.inlineKeyboard([
					[Markup.callbackButton('Daily', 'daily-' + data), Markup.callbackButton('Monthly', 'monthly-' + data)],
				]).extra());

			case 'daily':
				const dailyStats = await getDataDaily(data);
				const dailyChart = await createChart(data, dailyStats);
				return ctx.replyWithPhoto({ source: dailyChart });
			case 'monthly':
				const monthlyStats = await getDataMonthly(data);
				const monthlyChart = await createChart(data, monthlyStats);
				return ctx.replyWithPhoto({ source: monthlyChart });
			default:
				return ctx.replyWithMarkdown(`An error occurred. Please report the report and try again.`);
		}
	}
	catch(e) {
		console.log(e);
	}
}

module.exports = handleCallback;