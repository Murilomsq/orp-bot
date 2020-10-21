module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {

			
			setInterval(() => {
				console.log("hi");
			}, 1000);

			setInterval(() => {
				console.log("hey");
			}, 2000);


			console.log("KeepExecutingCode");
		
		
		
		
		
		
		

	},
};