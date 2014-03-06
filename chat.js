// JavaScript Document
var chatURL = "chat.php";
var getColorURL = "get_color.php";
var xmlHttpGetMessages = createXmlHttpRequestObject();
var xmlHttpGetColor = createXmlHttpRequestObject();
var updateInterval = 1000;
var debugMode =true;
var Cache = new Array();
var lastMessageID = -1;
var mouseX, mouseY;

function createXmlHttpRequestObject() {
	var xmlHttp;
	
	try {
		xmlHttp = new XMLHttpRequest();
	} catch(e) {
		var XmlHttpVersions = new Array("MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.5.0",
										"MSXML2.XMLHTTP.4.0","MSXML2.XMLHTTP.3.0",
										"MSXML2.XMLHTTP","Microsoft.XMLHTTP");
		for(var i=0;i<XmlHttpVersions.length && !xmlHttp; i++) {
			try{
				xmlHttp = new ActiveXObject(XmlHttpVersions[i]);	
			} catch(e){}
		}
	}
	
	if(!xmlHttp)
		alert("Error creating the XMLHttpRequest Object.");
	else
		return xmlHttp;
}

function init() {
	var oMessageBox = document.getElementById("messageBox");
	oMessageBox.setAttribute("autocomplete","off");
	var oSampleText = document.getElementById("sampleText");
	oSampleText.style.color = "black";
	checkUsername();
	requestNewMessages();
}

function checkUsername() {
	var oUser = document.getElementById("userName");
	if(oUser.value=="")
		oUser.value = "Guest" + Math.floor(Math.random() * 1000);	
}

function sendMessage() {
	var oCurrentMessage = document.getElementById("messageBox");
	var currentUser = document.getElementById("userName").value;
	var currentColor = document.getElementById("color").value;
	
	if(trim(oCurrentMessage.value) != "" && trim(currentUser) != "" && trim(currentColor) != "") {
		parameter = "mode=SendAndRetrieveNew" +
					"&id=" + encodeURIComponent(lastMessageID) +
					"&color=" +encodeURIComponent(currentColor) +
					"&name=" +encodeURIComponent(currentUser) +
					"&message=" + encodeURIComponent(oCurrentMessage.value);
		Cache.push(parameter);
		oCurrentMessage.value = "";
	}
}

function deleteMessages() {
	params = "mode=DeleteAndRetrieveNew";
	Cache.push(params);	
}

function requestNewMessages() {
	var currentUser = document.getElementById("userName").value;
	var currentColor = document.getElementById("color").value;
	
	if(xmlHttpGetMessages) {
		try {
			if(xmlHttpGetMessages.readyState == 4 || xmlHttpGetMessages.readyState == 0) {
				var params = "";
				if(Cache.length>0)
					params=Cache.shift();
				else
					params = "mode=RetrieveNew" +
							"&id=" +lastMessageID;
							//call server page
				xmlHttpGetMessages.open("POST", chatURL, true);
				xmlHttpGetMessages.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xmlHttpGetMessages.onreadystatechange = handleReceivingMessages;
				xmlHttpGetMessages.send(params);
			} else {
				setTimeout("requestNewMessages();",updateInterval);	
			}
		} catch (e) {
			displayError("Request not granted <br />"+e.toString());	
		}
	}
}

function handleReceivingMessages() {
	if(xmlHttpGetMessages.readyState == 4) {
		if(xmlHttpGetMessages.status == 200) {
			try {
				readMessages();	
			} catch(e) {
				displayError(e.toString());
			}
		} else {
			displayError("Message not handled correctly<br />"+xmlHttpGetMessages.statusText);	
		}
	}
}

function readMessages() {
	var response = xmlHttpGetMessages.responseText;
	if(response.indexOf("ERRNO") >= 0 || response.indexOf("error:") >= 0 || response.length == 0)
		throw(response.length <= 0 ? "Void server response." : "read messages error"+response);
	response = xmlHttpGetMessages.responseXML.documentElement;
	clearChat = response.getElementsByTagName("clear").item(0).firstChild.data;
	if(clearChat == "true") {
		document.getElementById("scroll").innerHTML = "";
		lastMessageID = -1;	
	}
	idArray = response.getElementsByTagName("id");
	colorArray = response.getElementsByTagName("color");
	nameArray = response.getElementsByTagName("name");
	timeArray = response.getElementsByTagName("time");
	messageArray = response.getElementsByTagName("message");
	displayMessages(idArray, colorArray, nameArray, timeArray, messageArray);
	if(idArray.length>0)
		lastMessageID = idArray.item(idArray.length-1).firstChild.data;
		setTimeout("requestNewMessages();", updateInterval);
}

function displayMessages(idArray, colorArray, nameArray, timeArray, messageArray) {
	for(var i=0; i<idArray.length; i++) {
		var color = colorArray.item(i).firstChild.data.toString();
		var time = timeArray.item(i).firstChild.data.toString();
		var name = nameArray.item(i).firstChild.data.toString();
		var message = messageArray.item(i).firstChild.data.toString();
		
		//HTML message to be displayed
		var htmlMessage = "";
		htmlMessage += "<div class=\"item\" style=\"color:" + color + "\">";
		htmlMessage += "[ " + time + " ] " + name + " :  ";
		htmlMessage += message.toString();
		htmlMessage += "</div>";
		
		displayMessage(htmlMessage);
	}
}

function displayMessage(message) {
	var oScroll = document.getElementById("scroll");
	var scrollDown = (oScroll.scrollHeight - oScroll.scrollTop <= oScroll.offsetHeight );
	oScroll.innerHTML += message;
	oScroll.scrollTop = scrollDown ? oScroll.scrollHeight : oScroll.scrollTop;
}

function displayError(message) {
	displayMessage("Error accessing the server! " +
						(debugMode ? "<br />" + message : ""));	
}

function handleKey(e) {
	e = (!e) ? window.event : e;
	//get the code of the character pressed
	code = (e.charCode) ? e.charCode :
			((e.keyCode) ? e.keyCode :
			((e.which) ? e.which : 0));	
	if (e.type == "keydown") {
		if(code == 13) {
			sendMessage();	
		}
	}
}

function trim(s) {
	return s.replace(/(^\s+)|(\s+$)/g, "")	
}

function getMouseXY(e) {
	if(window.ActiveXObject) {
		mouseX = window.event.x + document.body.scrollLeft;
		mouseY = window.event.y + document.body.scrollTop;	
	} else {
		mouseX = e.pageX;
		mouseY = e.pageY;	
	}
}

//1 function
function getColor(e) {
	getMouseXY(e);
	
	if(xmlHttpGetColor) {
		var offsetX = mouseX;
		var offsetY = mouseY;
		
		var oPalette = document.getElementById("palette");
		var oTd = document.getElementById("colorpicker");
		
		if(window.ActiveXObject) {
			offsetX = window.event.offsetX;
			offsetY = window.event.offsetY;	
		} else {
			offsetX -= oPalette.offsetLeft + oTd.offsetLeft;
			offsetY -= oPalette.offsetTop + oTd.offsetTop;	
		}
		
		//AJAX
		try {
			if(xmlHttpGetColor.readyState == 4 || xmlHttpGetColor.readyState == 0) {
				params = "?offsetx=" + offsetX + "&offsety=" + offsetY;
				xmlHttpGetColor.open("GET", getColorURL+params, true);
				xmlHttpGetColor.onreadystatechange = handleGettingColor;
				xmlHttpGetColor.send(null);
			}
		} catch(e) {
			displayError(xmlHttp.statusText);	
		}
	}
}

//2 handle state
function handleGettingColor() {
	if(xmlHttpGetColor.readyState == 4) {
		if(xmlHttpGetColor.status == 200) {
			try {
				changeColor();	
			} catch(e) {
				displayError(xmlHttpGetColor.statusText);	
			}
		} else {
			displayError(xmlHttpGetColor.statusText);	
		}
	}
}

//handle response
function changeColor() {
	response = xmlHttpGetColor.responseText;
	if(response.indexOf("ERRNO") >= 0 || response.indexOf("error: ") >=0 || response.length == 0)
		throw(response.length == 0 ? "Can't change color!" : response);
	var oColor = document.getElementById("color");
	var oSampleText = document.getElementById("sampleText");
	oColor.value = response;
	oSampleText.style.color;
	oSampleText.style.color = response;
	
}