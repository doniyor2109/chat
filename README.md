# chat
This pugun is for only chrome-extension. The plugin provides easy connection between content, background page an devtools page.

###USAGE 
You must plug in the code Chat.js into background page and content script. If you are using devtools plug there too.

Sending message from content to Devtools page
```javascript
chat.send({to:SCRIPTS.DEVTOOLS,message:{firstUse:'yes'}});

```

Recieving Devtools 
```javascript
chat.recieveContent=function(message){
if(message.firstUse=='yes'){
  alert('Hello');
}
}

```

