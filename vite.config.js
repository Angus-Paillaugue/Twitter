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
			socket.on('message', (data) => {
				const to = data.receiver, message = data.message;

				if(connectedUsers.hasOwnProperty(to)){
					connectedUsers[to].emit('message',{
						conversation: data.conversation,
						message
					});
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
	plugins: [sveltekit(), webSocketServer]
});
