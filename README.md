# Synapse X execute

an alternative to nexure's "synapse-execute" extension

please note the script provided below must be executed or this extension wont work, putting it into auto execute is recommended

# how to make it work

put the script into auto execute (recommended) or just execute it

# y it better

vscode is the websocket server, that means you dont need to use old syn ui to use it nor do you need synapse ui to be running, you only need the script provided below to be executed

the extension activates once you open a lua file, unlike nexure's one, which is always activated

lua compilation errors are redirected into vscode notification system

if you put the provided script into auto execute and have auto launch turned on, you dont even need to have any synapse ui running, the client will automaticaly connect once the extension is activated and execute button will appear

when no client/synapse is running and you click execute it doesnt bork itself like nexure's one

# some other features not mentioned above

when client connects or disconnects, you get a notification

when no client is connected you get a warn notification

# the script
```lua
repeat wait() until game:IsLoaded()
while wait(1) do
	pcall(function()
		local ws = syn.websocket.connect("ws://localhost:33882/")
		ws:Send("auth:" .. game.Players.LocalPlayer.Name)
		ws.OnMessage:Connect(function(msg)
			local func, err = loadstring(msg)
			if err then
				ws:Send("compile_err:" .. err)
				return
			end
			func()
		end)
		ws.OnClose:Wait()
	end)
end
```

# maybe in future

i will maybe make this say to vscode that this is a debugger and redirect output functions (print, warn, error) into the debug console

# other

dont read the source, i dont like js nor ts so dont expect it to look nice

if something doesnt work, contact me on discord fyz#7690

also bevare of unoriginal shameless skid ou1z