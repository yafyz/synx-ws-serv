import * as vscode from "vscode";
import * as http from "http";

const WebSocketServer: any = require("websocket").server;
const server: any = http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
});

server.listen(33882, () => {
	console.log("http server started");
});

const wss: any = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

let connected_user: any = null;
let user: any = null;

wss.on("request", function(request: any) {
	if (connected_user) {
		request.reject();
		console.log("New user tried to connect while one is already connected, rejected.");
	}
	request.requestedProtocols.push("synx");
	var connection = request.accept("synx", request.origin);
	connected_user = connection;
	console.log("New connection from", request.remoteAddress, ", awaiting authentication");

	setTimeout(() => {
		if (!user) {
			connected_user.close();
			console.log("Current connected user failed to authenticate, closing connection.");
		}
	}, 1000);

	connection.on("message", function(message: any) {
		if (message.type === "utf8") {
			let split = message.utf8Data.split(":");
			if (split.length < 2) { return; };

			if (split[0] === "auth" && !user) {
				user = split[1];
				vscode.window.showInformationMessage("Client " + user + " has connected");
				console.log("User", user ,"has authenticated");
			} else if (split[0] === "compile_err") {
				split[0] = "";
				vscode.window.showErrorMessage(split.join().slice(1));
			}
		}
	});

	connection.on("close", function(reasonCode: any, description: any) {
		console.log("Connection closed from", connection.remoteAddress, "(", user ,")");
		vscode.window.showInformationMessage("Client " + user + " has disconnected");
		connected_user = null;
		user = null;
	});
});


export function activate(context: vscode.ExtensionContext) {
	console.log("activate");

	context.subscriptions.push(
		vscode.commands.registerCommand("synx-ws-serv.activate", () => {
			console.log("synapse-ws-serv activated");
		})
	);
	context.subscriptions.push(
		vscode.commands.registerCommand("synx-ws-serv.execute", () => {
			if (!user) {
				vscode.window.showWarningMessage("No connected client");
				return;
			};
			let editor = vscode.window.activeTextEditor;
        	if (editor) {
				connected_user.sendUTF(editor.document.getText());
        	}
		})
	);

	let runItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left); // hi nexure
	runItem.command = "synx-ws-serv.execute"; // its just 5 lines pls dont kill me
	runItem.tooltip = "hi nexure, thanks"; // see its not completely copy pasted
	runItem.text = "$(debug-start) Synapse Execute"; // i even made it cooler, just look at this triangle, its way cooler
	runItem.show(); // bye nexure
}

export function deactivate() {
	console.log("deactivate");
	connected_user.close();
}
