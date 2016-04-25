/*
	This Object MUST BE created at the beginning of script


 */
const SCRIPTS={BACKGROUND:1,CONTENT:2,DEVTOOLS:3};
function Chat(){
	this.backgroundConnections=[];
	this.devtoolsConnections=[];



	this.receiveContent=function () {};
	this.receiveDevtools=function (data) {};
	this.receiveBackground=function () {};

	this.scriptType=this.detectScript();
	this.receiveDevtoolsPrivate=function () {};
	this.receiveContentPrivate=function () {};
	this.receiveBackgroundPrivate=function () {};

	this.init();

	if(this.scriptType==SCRIPTS.DEVTOOLS){
		this.receiveBackgroundPrivate=function (data) {
			if(data.action=='getDevtoolTabId'){
				this.send({to:SCRIPTS.BACKGROUND,message:{privateChat:true,action:'setDevtoolTabId',tabId:chrome.devtools.inspectedWindow.tabId}});
			}
		};
	}
}
Chat.prototype = {
	init: function () {
		switch(this.scriptType){
			case SCRIPTS.BACKGROUND:
				//init connection between dectools
				chrome.runtime.onConnect.addListener(function(devToolsConnection) {
					devToolsConnection.postMessage({from:this.scriptType,to:SCRIPTS.DEVTOOLS,message:{privateChat:true,action:'getDevtoolTabId'}});
					devToolsConnection.onDisconnect.addListener(function(port) {
						this.devtoolsConnections.every(function (c, i) {
							if(c.name==port.name){
								delete this.devtoolsConnections[i];
								return false;
							}
							return true;
						}.bind(this));
					}.bind(this));

					//listening devtools
					devToolsConnection.onMessage.addListener(function (message,sender,sendResponse) {
						switch (message.to){
							case SCRIPTS.BACKGROUND:
								if(message.message.privateChat){
									if(message.message.action=='setDevtoolTabId'){
										this.devtoolsConnections[message.message.tabId]=devToolsConnection;
									}
								} else
								this.receiveDevtools(message.message,sender,sendResponse);
								break;
							default :
								//redirect
								this.send(message);
						}
					}.bind(this));
				}.bind(this));
				//listening content
				chrome.runtime.onMessage.addListener(
					function(request, sender, sendResponse) {
						switch (request.to){
							case SCRIPTS.BACKGROUND:
									if(request.message.privateChat){
										this.receiveContentPrivate(request.message,sender,sendResponse);
									} else
									this.receiveContent(request.message,sender,sendResponse);

								break;
							default :
								//redirect
								request.tabId=sender.tab.id;
								this.send(request);
						}
					}.bind(this)
				);
				break;
			case SCRIPTS.DEVTOOLS:
				//init connection between background
				this.backgroundConnection = chrome.runtime.connect({name: "devtools"+Date.now().toString()});
				//listening background
				this.backgroundConnection.onMessage.addListener(function (message) {
					if(message.from==SCRIPTS.CONTENT){
						if(message.message.privateChat){
							this.receiveContentPrivate(message.message);
						} else
						this.receiveContent(message.message);
					} else if(message.from==SCRIPTS.BACKGROUND){
						if(message.message.privateChat){
							this.receiveBackgroundPrivate(message.message);
						} else
						this.receiveBackground(message.message);
					}
				}.bind(this));
				break;
			case SCRIPTS.CONTENT:
				//listening background
				chrome.runtime.onMessage.addListener(
					function(request, sender, sendResponse) {
						if(request.data.from==SCRIPTS.DEVTOOLS){
							if(request.data.message.privateChat){
								this.receiveDevtoolsPrivate(request.data.message,sender,sendResponse);
							} else
							this.receiveDevtools(request.data.message,sender,sendResponse);
						} else if(request.data.from==SCRIPTS.BACKGROUND){
							if(request.data.message.privateChat){
								this.receiveBackgroundPrivate(request.data.message,sender,sendResponse);
							} else
							this.receiveBackground(request.data.message,sender,sendResponse);
						}
					}.bind(this)
				);
				break;
		}
	},
	send:function(e){
		var to,from=this.scriptType,message= e,data;
		if(isObject(e)){
			to= e.to;
			message= e.message;
			from= e.from || from;
		}
		data={from:from,to:to,message:message};

		switch (this.scriptType){
			case SCRIPTS.BACKGROUND:
				if(to==SCRIPTS.CONTENT){
					//to content
					if(!e.tabId){
						chrome.tabs.query(
							{currentWindow:true,active:true},
							function (tabs) {
								chrome.tabs.sendMessage(
									tabs[0].id,
									{data: data},
									function(response) {}
								);
							}
						);
					} else {
						chrome.tabs.sendMessage(
							e.tabId,
							{data: data},
							function(response) {}
						);
					}

				} else if(to==SCRIPTS.DEVTOOLS){
					//to devtools
					if(!e.tabId){
						chrome.tabs.query(
							{currentWindow:true,active:true},
							function (tabs) {
								try{
									this.devtoolsConnections[tabs[0].id].postMessage(data);
								} catch(ex){
									console.log('devtools not created or deleted');
								}

							}.bind(this)
						);
					} else {
						try{
							this.devtoolsConnections[e.tabId].postMessage(data);
						} catch(ex){
							console.log('devtools not created or deleted');
						}
					}

				}
				break;
			case SCRIPTS.CONTENT :
				//to background
				chrome.runtime.sendMessage(data);
				break;
			case SCRIPTS.DEVTOOLS:
				data.tabId=chrome.devtools.inspectedWindow.tabId;
				this.backgroundConnection.postMessage(data);
				break;
		}

	},
	detectScript:function(){
		// TODO accurate method of detecting
	    var script=SCRIPTS.CONTENT;
		if(chrome.tabs){
		    script=SCRIPTS.BACKGROUND;
	    } else if (chrome.devtools){
			script=SCRIPTS.DEVTOOLS;
		}
		return script;
	}
};

var chat = new Chat();