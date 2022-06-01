/*
*   _____ __     _____                  ____                 _ 
*  | ____/ /_   | ____|__ _ ___ _   _  / ___|  ___ _ __   __| |
*  |  _|| '_ \  |  _| / _` / __| | | | \___ \ / _ \ '_ \ / _` |
*  | |__| (_) | | |__| (_| \__ \ |_| |  ___) |  __/ | | | (_| |
*  |_____\___/  |_____\__,_|___/\__, | |____/ \___|_| |_|\__,_|
*                               |___/                          
*
* E6 easy send -  The easy way to send posts to Discord
* Main logic file.
*
* Copyright (c) 2022 Chris G.
*/
const _ = (id) => {return document.getElementById(id)}

let storage = null;
let disabled = false;
let sendOnDBClick = true;
let autoSent = false;
let autoSentID;
let webhookURLCache = "";
let postState = 1;                     //1: init;  2: sending;  3: sent ok!;  4: error;  5: in history;





(async () => {
	const settingsOBJ = (await browser.storage.local.get()) || {};
	
	if(!settingsOBJ.sv || settingsOBJ.sv < 3){
		disabled = true;
		if(settingsOBJ.sv == 1) createModalBox("E6 Easy Send Update!", "Hello, An update has been installed for E6 Easy Send!<br>Please open the extension menu to check out the new features!<br><br><i>this message will never appear after the extension menu has been opened at least once.</i>");
		else if(settingsOBJ.sv == 2) createModalBox("E6 Easy Send Update!", "Hey! An update has been installed for E6 Easy Send!<br>Please open the extension menu to check out the new features!<br>Added new color picker & new customization options!<br><br><i>this message will never appear after the extension menu has been opened at least once.</i>");
		else createModalBox("Thanks for installing me!", "To enable E6 Easy Send, please open the menu by clicking its icon in the top-right of the browser;<br>Paste a Discord webhook URL in the input box and refresh the page!<br><br><i>this message will never appear after the extension menu has been opened at least once.</i>");
		return;
	}


	if(settingsOBJ.flags_delete_history){
		localStorage.removeItem("e6es_ph");

		browser.storage.local.set({flags_delete_history: false})
		.catch(displayNativeNoticeAsError);
	}

	createAndAppendCustomStyles(
		settingsOBJ.advSet_sendbtn_clrs_btnBaseColorCustom,
		settingsOBJ.advSet_sendbtn_clrs_btnPressedColorCustom,
		settingsOBJ.advSet_sendbtn_clrs_btnSentColorCustom,
		settingsOBJ.advSet_sendbtn_clrs_btnSendagainColorCustom,
		settingsOBJ.advSet_sendbtn_clrs_btnDeleteColorCustom
	);


	sendOnDBClick = settingsOBJ.hasOwnProperty("sendOnDBClick") ? settingsOBJ.sendOnDBClick : true;


	if(!_("e6easysend_mainSendBTN_wrapper") && _("image-download-link") && _("image-container")){
		createAndAppendSendButton(settingsOBJ.advSet_sendbtn_baseText);


		if(settingsOBJ.rememberPostHistory == "off"){             storage = null; sessionStorage.removeItem("e6es_ph");}   //clear session storage if setting got changed while script was not loaded.
		else if(settingsOBJ.rememberPostHistory == "permanently") storage = localStorage;
		else if(settingsOBJ.rememberPostHistory == "session")     storage = sessionStorage;


		if(postInHistory(_("image-container").getAttribute("data-id"))){
			postState = 5;
			_("e6easysend_mainSendBTN").setAttribute("data-state", "sendagain");
			_("e6easysend_mainSendBTN").innerText = "Send again?";
			return;
		}
		
		if(settingsOBJ.sendOnView){
			autoSent = true;
			_("e6easysend_mainSendBTN_wrapper").click();
		}
	}
})().catch((ex) => {console.error(ex); displayNativeNoticeAsError(ex);});





function displayNativeNoticeAsError(msg){     //this function highjacks #notice from e621/e926. Not a very good approach, but good enough for the rare error-cases
	if(_("notice")){
		_("notice").classList.remove("ui-state-highlight");
		_("notice").classList.add("ui-state-error"); //classes from e621/e926.
		_("notice").children[0].innerText = "";
		_("notice").children[0].append(
			document.createTextNode("E6 Easy Send init-error!"),
			document.createElement("br"),
			document.createTextNode(msg),
			document.createElement("br"),
			document.createElement("br"),
			document.createTextNode("Please report this error to the developers of E6 Easy Send!")
		);
		_("notice").style.display = "";
	}
	else alert("e6 easy send error: " + msg);                          //terrible, should never happen.
}



function createModalBox(title, description, width = "auto", height = "auto"){
	const closeBTN = document.createElement("span");
	closeBTN.appendChild(document.createTextNode("✖"));
	closeBTN.setAttribute("id", "e6es_modal_box_wrapper_close_btn");
	closeBTN.style.position = "absolute";
	closeBTN.style.right = "7px";
	closeBTN.style.top = "5px";
	closeBTN.style.color = "#ff6767";
	closeBTN.style.cursor = "pointer";
	closeBTN.style.fontSize = "1.5em";

	const titleText = document.createElement("div");
	titleText.style.fontSize = "2.5em";
	titleText.style.color = "#e9f2fa";
	titleText.appendChild(document.createTextNode(title))

	const bodyText = document.createElement("div");
	bodyText.style.color = "#e9f2fa";
	bodyText.style.marginTop = "15px";
	bodyText.insertAdjacentHTML("beforeend", description);

	const alertBody = document.createElement("div");
	alertBody.setAttribute("id", "e6es_modal_box_wrapper");
	alertBody.appendChild(closeBTN);
	alertBody.appendChild(titleText);
	alertBody.appendChild(bodyText);
	alertBody.style.backgroundColor = "#1f3c67";
	alertBody.style.maxWidth = "90%";
	alertBody.style.textAlign = "center";
	alertBody.style.position = "fixed";
	alertBody.style.left = "50%";
	alertBody.style.top = "50%";
	alertBody.style.padding = "35px";
	alertBody.style.border = "2px solid #0f0f0f";
	alertBody.style.borderRadius = "20px";
	alertBody.style.transform = "translate(-50%, -50%)";
	if(width !== "auto") alertBody.style.width = width;
	if(height !== "auto") alertBody.style.height = height;


	document.body.appendChild(alertBody);
}



function createAndAppendCustomStyles(baseColor, hoverColor, successColor, sendAgainColor, deleteColor){
	const customStyles = document.createElement("style");
	customStyles.setAttribute("id", "e6easysend_custom_styles");
	customStyles.textContent =
		`.e6easysend_buttonSend{
			cursor: pointer;
			background-color: ${checkHexColorValidity(baseColor, "#5865F2")};
			color: ${getColorLuminocity(checkHexColorValidity(baseColor, "#5865F2"), true) ? "#000000" : "#ffffff"};
		}
		.e6easysend_buttonSend:hover{
			background-color: ${checkHexColorValidity(hoverColor, "#2e39ab")};
			color: ${getColorLuminocity(checkHexColorValidity(hoverColor, "#2e39ab"), true) ? "#000000" : "#ffffff"};
		}
		.e6easysend_buttonSend[data-state="sending"]{
			background-color: #303030;
			color: #ffffff;
		}
		.e6easysend_buttonSend[data-state="delete"]{
			background-color: ${checkHexColorValidity(deleteColor, "#f03f09ff")};
			color: ${getColorLuminocity(checkHexColorValidity(deleteColor, "#f03f09ff"), true) ? "#000000" : "#ffffff"};
		}
		.e6easysend_buttonSend[data-state="true"]{
			background-color: ${checkHexColorValidity(successColor, "#1b853cff")};
			color: ${getColorLuminocity(checkHexColorValidity(successColor, "#1b853cff"), true) ? "#000000" : "#ffffff"};
		}
		.e6easysend_buttonSend[data-state="false"]{
			background-color: #a83232;
			color: #ffffff;
		}
		.e6easysend_buttonSend[data-state="sendagain"]{
			background-color: ${checkHexColorValidity(sendAgainColor, "#32e26dff")};
			color: ${getColorLuminocity(checkHexColorValidity(sendAgainColor, "#32e26dff"), true) ? "#000000" : "#ffffff"};
		}`;
	document.getElementsByTagName("head")[0].appendChild(customStyles);
}



function createAndAppendSendButton(text = "Send to Discord"){
	const btn = document.createElement("span");
	btn.classList.add("button", "e6easysend_buttonSend");                                               //button: e926/621 default class.
	btn.setAttribute("id", "e6easysend_mainSendBTN");
	btn.appendChild(document.createTextNode(text));

	const btnWrapper = document.createElement("div");
	btnWrapper.setAttribute("id", "e6easysend_mainSendBTN_wrapper");
	btnWrapper.appendChild(btn);


	_("image-download-link").parentNode.insertBefore(btnWrapper, _("image-download-link").nextSibling); //image-download-link: e926/621 Download button.
}



function checkHexColorValidity(hex, def = null){
	return /^#([0-9a-f]{3}){1,2}$/i.test(hex) ? hex : /^#([0-9a-f]{2}){4}$/i.test(hex) ? hex : def;
}

function getColorLuminocity(hex, darknessCheck){
	let rgb = hex.substring(1).split("");
	let r, g, b;

	if(rgb.length == 3 || rgb.length == 4) r = parseInt(rgb[0] + rgb[0], 16), g = parseInt(rgb[1] + rgb[1], 16), b = parseInt(rgb[2] + rgb[2], 16);
	else if(rgb.length == 6 || rgb.length == 8) r = parseInt(rgb[0] + rgb[1], 16), g = parseInt(rgb[2] + rgb[3], 16), b = parseInt(rgb[4] + rgb[5], 16);
	else throw new TypeError("Invalid hex color code given to getColorLuminocity");
	
	if(darknessCheck) return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128 ? true : false;
	else return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}


function postInHistory(id){
	if(!storage) return null;
	return new RegExp(id + ",").test(storage.getItem("e6es_ph"));
}


function checkWebhookURLValidity(url){
	try{
		if(!url || typeof url !== "string") return false;

		const urlObj = new URL(url);

		if(urlObj.hostname !=="discord.com") return false;
		if(urlObj.protocol !=="https:") return false;
		if(!(/^\/api\/webhooks\/[0-9]{18}\/[a-z0-9\-\_]{68}$/i.test(urlObj.pathname))) return false;
		
		return true;
	}
	catch(e){ return false }
}



async function sendToWebhook(webhookURL, mediaURL, postURL, ups, downs, favs, webhookName, type = "text", embedClr = 9442302, username = null){
	const payloadJSON = {
		username: webhookName
	}
	const statusBar = (username === null ? "" : "Sent by: '" + username + "' on " + window.location.hostname + "\n") + "👍" + ups + " | " + downs + "👎**            **❤️" + favs;
	const mediaType = mediaURL.split(".")[mediaURL.split(".").length - 1];


	if(type == "embed"){
		payloadJSON.embeds = [{
			title: "Go to the post",
			description: statusBar,
			url: postURL,
			color: embedClr,
		}];


		if(mediaType.toLowerCase() === "webm" || mediaType.toLowerCase() === "mp4"){
			delete payloadJSON.embeds;                                                 //janky. Discord can't have embedded videos in rich embeds.
			payloadJSON.content = statusBar + "\n" + "<" + postURL + ">\n" + mediaURL;
		}
		else payloadJSON.embeds[0].image = { url: mediaURL };
	}
	else if(type == "text"){
		payloadJSON.content = statusBar + "\n" + "<" + postURL + ">\n" + mediaURL;     //todo: send as attch!
	}
	else throw new TypeError("Argument 'type' must be either 'text' or 'embed'. Got: " + type);


	const resp = await fetch(webhookURL + "?wait=true", {
		method: "post",
		mode: "cors",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payloadJSON)
	});

	if(resp.ok) return resp;
	else return false;
}



async function sendPostToWebhook(){
	if(postState == 3) return;
	postState = 2;
	_("e6easysend_mainSendBTN").setAttribute("data-state", "sending");

	const settingsOBJ = (await browser.storage.local.get(["webhookURL", "sendAs", "sendUsername", "advSet_sendbtn_baseTextSent", "advSet_webhook_displayname", "advSet_webhook_displayColor"])) || {}
	if(!settingsOBJ.webhookURL || !checkWebhookURLValidity(settingsOBJ.webhookURL)){
		postState = 4;
		_("e6easysend_mainSendBTN").setAttribute("data-state", "false");
		return createModalBox("Webhook URL missing", "Please provide a valid webhook URL in the add-on menu to use this feature.");
	}
	webhookURLCache = settingsOBJ.webhookURL;

	
	try{
		const postData = JSON.parse(_("image-container").getAttribute("data-post"));
		const result = await sendToWebhook(
			settingsOBJ.webhookURL,
			(postData.file.url || "unknown link"),
			("https://" + window.location.hostname + "/posts/" + postData.id),
			postData.score.up,
			Math.abs(postData.score.down),
			postData.fav_count,
			(settingsOBJ.advSet_webhook_displayname || "E6 Easy Send"),
			(settingsOBJ.sendAs || "text"),
			(settingsOBJ.advSet_webhook_displayColor === "default" ? 9716272 : settingsOBJ.advSet_webhook_displayColor === "random" ? (Math.floor(Math.random() * 16777215)) : parseInt(checkHexColorValidity(settingsOBJ.advSet_webhook_displayColor.length > 7 ? settingsOBJ.advSet_webhook_displayColor.slice(0, -2) : settingsOBJ.advSet_webhook_displayColor, "#944230").substring(1), 16)),
			(settingsOBJ.sendUsername ? (document.body.getAttribute("data-user-name") || "Anonymous") : null)
		);

		if(!result){
			postState = 4;
			_("e6easysend_mainSendBTN").setAttribute("data-state", "false");
		}
		postState = 3;

		if(postInHistory(postData.id) === false){
			storage.setItem("e6es_ph", ((storage.getItem("e6es_ph") || "") + (postData.id + ",")));
		}

		if(autoSent){
			const msg = await result.json();
			
			if(msg.id){
				_("e6easysend_mainSendBTN").setAttribute("data-state", "delete");
				_("e6easysend_mainSendBTN").innerText = ("Delete from Discord");
				autoSentID = msg.id;
				return;
			}
			
			console.log(msg)
			throw new TypeError("Discord did not retrun a message ID!");
		}

		_("e6easysend_mainSendBTN").setAttribute("data-state", "true");
		_("e6easysend_mainSendBTN").innerText = (settingsOBJ.advSet_sendbtn_baseTextSent || "Sent to Discord");
	}
	catch(ex){
		postState = 4;
		createModalBox("Error sending media", "An error occured while sending that message to Discord.<br>" + ex)
		console.error(ex);
		_("e6easysend_mainSendBTN").setAttribute("data-state", "false");
	}
}



async function deleteLastAutoSend(){
	if(_("e6easysend_mainSendBTN").disabled) return;
	_("e6easysend_mainSendBTN").disabled = true;

	const resp = await fetch(webhookURLCache + "/messages/" + autoSentID, {
		method: "delete",
		mode: "cors",
	});

	if(resp.status == 204){
		_("e6easysend_mainSendBTN").innerText = "Deleted!";

		if(postInHistory(_("image-container").getAttribute("data-id"))){
			storage.setItem("e6es_ph", ((storage.getItem("e6es_ph") || "").replace(_("image-container").getAttribute("data-id") + ",", "")));
		}
		return true;
	}
	_("e6easysend_mainSendBTN").innerText = "Unable to delete!";
	return false;
}




document.body.addEventListener("click", async (e) => {
	if(e.target.id !== "e6easysend_mainSendBTN" && e.target.id !== "e6easysend_mainSendBTN_wrapper" && e.target.id !== "e6es_modal_box_wrapper_close_btn") return;

	if(e.target.id == "e6easysend_mainSendBTN" || e.target.id == "e6easysend_mainSendBTN_wrapper"){
		if(_("e6easysend_mainSendBTN").getAttribute("data-state") == "delete") return await deleteLastAutoSend();
		if(postState !== 2) await sendPostToWebhook();
	}
	else if(e.target.id == "e6es_modal_box_wrapper_close_btn"){
		_("e6es_modal_box_wrapper").remove();
	}
});



_("image-container").addEventListener("dblclick", async (e) => {
	e.stopImmediatePropagation();
	e.stopPropagation();
	e.preventDefault();

	if(!sendOnDBClick) return;
	if(postState !== 2 && postState !== 5) await sendPostToWebhook();
});




browser.storage.onChanged.addListener((changes, area) => {
	if(!area === "local") return;

	for(const changedProp in changes){
		switch(changedProp){
			case "sendOnDBClick":
				sendOnDBClick = Boolean(changes[changedProp].newValue);
				break;
			
			case "rememberPostHistory":
				//todo: handle data transfer better
				if(changes[changedProp].oldValue == "permanently" && changes[changedProp].newValue == "session"){
					sessionStorage.setItem("e6es_ph", (localStorage.getItem("e6es_ph") || ""));
				}

				if(changes[changedProp].newValue == "permanently") storage = localStorage;
				else if(changes[changedProp].newValue == "session") storage = sessionStorage;
				else storage = null;

				if(postInHistory(_("image-container").getAttribute("data-id"))){
					postState = 5;
					_("e6easysend_mainSendBTN").setAttribute("data-state", "sendagain");
					_("e6easysend_mainSendBTN").innerText = "Send again?";
				}
				break;


			case "advSet_sendbtn_clrs_btnBaseColorCustom":
				_("e6easysend_custom_styles").sheet.cssRules[0].style.backgroundColor = checkHexColorValidity(changes[changedProp].newValue, "#5865F2ff");
				_("e6easysend_custom_styles").sheet.cssRules[0].style.color = getColorLuminocity(checkHexColorValidity(changes[changedProp].newValue, "#5865F2ff"), true) ? "#000000" : "#ffffff"
				break;
			case "advSet_sendbtn_clrs_btnPressedColorCustom":
				_("e6easysend_custom_styles").sheet.cssRules[1].style.backgroundColor = checkHexColorValidity(changes[changedProp].newValue, "#2e39abff");
				_("e6easysend_custom_styles").sheet.cssRules[1].style.color = getColorLuminocity(checkHexColorValidity(changes[changedProp].newValue, "#2e39abff"), true) ? "#000000" : "#ffffff"
				break;
			case "advSet_sendbtn_clrs_btnDeleteColorCustom":
				_("e6easysend_custom_styles").sheet.cssRules[3].style.backgroundColor = checkHexColorValidity(changes[changedProp].newValue, "#f03f09ff");
				_("e6easysend_custom_styles").sheet.cssRules[3].style.color = getColorLuminocity(checkHexColorValidity(changes[changedProp].newValue, "#f03f09ff"), true) ? "#000000" : "#ffffff"
				break;
			case "advSet_sendbtn_clrs_btnSentColorCustom":
				_("e6easysend_custom_styles").sheet.cssRules[4].style.backgroundColor = checkHexColorValidity(changes[changedProp].newValue, "#1b853cff");
				_("e6easysend_custom_styles").sheet.cssRules[4].style.color = getColorLuminocity(checkHexColorValidity(changes[changedProp].newValue, "#1b853cff"), true) ? "#000000" : "#ffffff"
				break;
			case "advSet_sendbtn_clrs_btnSendagainColorCustom":
				_("e6easysend_custom_styles").sheet.cssRules[6].style.backgroundColor = checkHexColorValidity(changes[changedProp].newValue, "#32e26dff");
				_("e6easysend_custom_styles").sheet.cssRules[6].style.color = getColorLuminocity(checkHexColorValidity(changes[changedProp].newValue, "#32e26dff"), true) ? "#000000" : "#ffffff"
				break;
			
			
			case "advSet_sendbtn_baseText":
				if(postState === 1) _("e6easysend_mainSendBTN").innerText = changes[changedProp].newValue || "Send to Discord";
				break;
			case "advSet_sendbtn_baseTextSent":
				if(postState === 3) _("e6easysend_mainSendBTN").innerText = changes[changedProp].newValue || "Sent to Discord";
				break;
			

			default:
				break;
		}
	}
});