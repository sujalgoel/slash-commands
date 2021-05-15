const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require('node-fetch');
const config = require('./config.json');
const { Slash } = require('discord-slash-commands');
const slash = new Slash({ client: client });

slash.on('command', async (command) => {
	if (command.name === 'youtube') {
		const channel = client.channels.cache.get(command.options.find(m => m.name === 'channel').value);
		if (channel.type !== 'voice') {
			const embed = new Discord.MessageEmbed();
			embed.setDescription('<a:wrongggg:755042144539902013> **| Please select a voice channel!**');
			embed.setColor('#ff0000');
			command.callback({
				embeds: embed,
			});
			return;
		}
		fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
			method: 'POST',
			body: JSON.stringify({
				max_age: 86400,
				max_uses: 0,
				target_application_id: config.YouTube,
				target_type: 2,
				temporary: false,
				validate: null,
			}),
			headers: {
				'Authorization': `Bot ${config.token}`,
				'Content-Type': 'application/json',
			},
		})
			.then(res => res.json())
			.then(invite => {
				const embed = new Discord.MessageEmbed();
				embed.setDescription(`<a:checkmark:766294123372085318> **| Added YouTube to [${channel.name}](https://discord.gg/${invite.code})**`);
				embed.setColor('#00ff00');
				command.guild.channels.cache.get('838699771735703572').send(embed);
				command.callback('OK');
			});
	}
	if (command.name === 'wikipedia') {
		const wiki = command.options.find(m => m.name === 'search').value;
		const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wiki.toLowerCase())}`;
		let response;
		try {
			response = await fetch(url).then(res => res.json());
		} catch (e) {
			console.log(e);
			const embed = new Discord.MessageEmbed();
			embed.setDescription('<a:wrongggg:755042144539902013> **| Something went wrong... Please try again later!**');
			embed.setColor('#ff0000');
			command.callback({
				embeds: embed,
			});
			return;
		}
		if (response.title === 'Not found.') {
			const embed = new Discord.MessageEmbed();
			embed.setDescription('<a:wrongggg:755042144539902013> **| The given term cannot be found on Wikipedia!**');
			embed.setColor('#ff0000');
			command.callback({
				embeds: embed,
			});
			return;
		} else if (response.type === 'disambiguation') {
			const embed = new Discord.MessageEmbed();
			embed.setColor('RANDOM');
			embed.setTitle(response.title);
			embed.setURL(response.content_urls.desktop.page);
			embed.setDescription([`${response.extract} 
			Links For Topic You Searched [Link](${response.content_urls.desktop.page}).`]);
			command.callback({
				embeds: embed,
			});
		} else {
			const embed = new Discord.MessageEmbed();
			embed.setColor('RANDOM');
			embed.setTitle(response.title);
			embed.setURL(response.content_urls.desktop.page);
			embed.setThumbnail(response.thumbnail.source);
			embed.setDescription(response.extract);
			command.callback({
				embeds: embed,
			});
		}
	}
});

client.on('ready', () => {
	console.log(`${client.user.username} is online!`);
	slash.create({
		guildOnly: true,
		guildID: config.guildID,
		data: {
			name: 'youtube',
			description: 'Voice Channel YouTube.',
			options: [{
				name: 'channel',
				description: 'Select the voice channel.',
				required: true,
				type: 7,
			}],
		},
	});
	slash.create({
		guildOnly: true,
		guildID: config.guildID,
		data: {
			name: 'wikipedia',
			description: 'Search on Wikipedia.',
			options: [{
				name: 'search',
				description: 'Specify a term for search.',
				required: true,
				type: 3,
			}],
		},
	});
});

client.login(config.token);