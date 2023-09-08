import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		let connectedUsers = {};

		io.on('connection', async(socket) => {
			socket.on('message', (message) => {

				if(connectedUsers.hasOwnProperty(message.receiver.username) && !message.receiver.blockedUsers.includes(message.sender)){
					connectedUsers[message.receiver.username].emit('message', message);
				}
			});
			socket.on('register',function(username){
				socket.username = username;
				connectedUsers[username] = socket;
			});
		});
	}
}

export default defineConfig({
	server: {
		port: 5171,
	},
	preview: {
		port: 80,
	},
	plugins: [sveltekit(), webSocketServer],
});
