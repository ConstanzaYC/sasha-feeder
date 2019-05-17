const five = require('johnny-five');
const Raspi = require('raspi-io');
const cron = require('node-cron');
const notifier = require('mail-notifier');


const board = new five.Board({
  io: new Raspi()
});
board.on('ready', function() {
	const servo = new five.Servo({
		pin: 'GPIO18', 
		type: 'continuous',		
	});

	const feedTheCats = () => {
		servo.cw(0.15);
		setTimeout(() => servo.stop(), 2000);
	}

	const imap = {
		user: process.env.user, 
		password: process.env.pass,
		host: 'imap.gmail.com',
		port: 993, // imap port
		tls: true,// use secure connection
		tlsOptions: { rejectUnauthorized: false }
	};

	notifier(imap)
	.on('mail', mail => {
		if (mail.from[0].address === process.env.sender && mail.subject === process.env.subject) {
			feedTheCats();
		} else {
			console.log('El mail ' + mail.from[0].address + ' no tiene autorización para alimentar a Orson y Haku');
		}
	})
	.start();
	
	const time = cron.schedule(process.env.cron, () => feedTheCats());
});

