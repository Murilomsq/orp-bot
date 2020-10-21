

module.exports = {

	//Properties of the command
	name: 'rtscan',
	//Execution line

	execute(message, args) {

		//making the server requisition
		const api1 = "https://api.battlemetrics.com/servers?page[size]=20&filter[game]=ark&filter[search]=" + args[0];
		const snekfetch = require("snekfetch");



		//execution with the api
		snekfetch.get(api1).then(r => {

			//Assigning the JSON object to serverListBody
			let serverListBody = r.body;
		
			//String manipulation
			let serverName = serverListBody.data[0].attributes.name;
			serverName = serverName.replace(/\s+/g, '');
			let nameInserted = "";
			for (let i = 0; i < args.length; i++) {
				nameInserted += args[i].trim();
			}


			if (serverName === nameInserted) {

				const api2 = "https://api.battlemetrics.com/players?page[size]=70&filter[servers]=" + serverListBody.data[0].attributes.id + "&filter[online]=true"
				snekfetch.get(api2).then(d => {

					let playerListBody = d.body;
					//Update the JSON objects each 5 seconds
					setInterval(() => {
						snekfetch.get(api1).then(c => {
							serverListBody = c.body;
						});

						snekfetch.get(api2).then(c => {
							playerListBody = c.body;
						});
					}, 5000);
					let msgBuilder = "```diff\n";
					let serverStatus = serverListBody.data[0].attributes.status;

					function online() {
						if (serverListBody.data[0].attributes.status === "online") {
							return "+";
						}
						return "-";
					}

					function onlinePlayers() {
						if (serverListBody.data[0].attributes.status === "online") {
							return playerListBody.data.length;
						}
						return 0;
					}



					//Sendind the Header and updating it
					message.channel.send(`\`\`\`diff
- ${serverListBody.data[0].attributes.name}
${online()} ${serverListBody.data[0].attributes.status}
- ${onlinePlayers()} players online
\`\`\``).then(sentMessage => {
	setInterval(() => {
		sentMessage.edit(`\`\`\`diff
- ${serverListBody.data[0].attributes.name}
${online()} ${serverListBody.data[0].attributes.status}
- ${onlinePlayers()} players online
\`\`\``);
		console.log("Header Updated!");
	}, 5000);
});

					if (onlinePlayers() !== 0) {
						for (let i = 0; i < playerListBody.data.length; i++) {
							msgBuilder = msgBuilder.concat(`+ ${playerListBody.data[i].attributes.name}\n`)
						}
						msgBuilder = msgBuilder.concat("\n```\n");
						message.channel.send(msgBuilder).then((sentMessage) => {
							setInterval(() => {
								msgBuilder = "```diff\n";
								for (let i = 0; i < playerListBody.data.length; i++) {
									msgBuilder = msgBuilder.concat(`+ ${playerListBody.data[i].attributes.name}\n`)
								}
								msgBuilder = msgBuilder.concat("\n```\n");
								sentMessage.edit(msgBuilder);
								console.log("Player list updated!");
							}, 5000);
							
						});
					}
				});

			}
			else {

				let serverListMsg = "```diff\n";

				try {
					for (let i = 0; i < serverListBody.data.length; i++) {
						serverListMsg = serverListMsg.concat(`+ ${serverListBody.data[i].attributes.name}\n`)
					}
					serverListMsg = serverListMsg.concat("\n```");
					message.channel.send("Wrong syntax, copy and paste one of the following servers to the command");
					message.channel.send(serverListMsg);
				}
				catch (error) {
					console.error(error);
					message.channel.send("No found servers with your keywords");
				}

			}
		});

	},
};


