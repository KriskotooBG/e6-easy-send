/*
*   _____ __     _____                  ____                 _ 
*  | ____/ /_   | ____|__ _ ___ _   _  / ___|  ___ _ __   __| |
*  |  _|| '_ \  |  _| / _` / __| | | | \___ \ / _ \ '_ \ / _` |
*  | |__| (_) | | |__| (_| \__ \ |_| |  ___) |  __/ | | | (_| |
*  |_____\___/  |_____\__,_|___/\__, | |____/ \___|_| |_|\__,_|
*                               |___/                          
*
* E6 easy send -  The easy way to send posts to Discord
* Add-on Pop-up menu logic file.
*
* Copyright (c) 2022 Chris G.
*/
const _ = (id) => {return document.getElementById(id)}
const setErrorState = (msg, clr = "#ad2626") => {document.body.style.backgroundColor = clr; document.body.innerText = msg; document.body.appendChild(document.createElement("BR")); document.body.innerText += (msg?.stack || "")} 






(async () => {
	const curTheme = await browser.theme.getCurrent() || null;
	const styleTag = document.createElement("style");
	styleTag.textContent = 
		`:root{
			--browser_bg_clr: ${ (curTheme?.colors?.popup || "#f5f5f5") + ";" }
			--browser_tx_clr: ${ (curTheme?.colors?.popup_text || "#000000") +  ";" }
			--browser_br_clr: ${ (curTheme?.colors?.popup_border || "#262626") + ";"}

			--browser_inp_bg_clr: ${ (curTheme?.colors?.input_background || "#a6a6a6") + ";"}
			--browser_inp_tx_clr: ${ (curTheme?.colors?.input_color || "#030303") + ";"}
			--borwser_inp_br_clr: ${ (curTheme?.colors?.input_border || "#545454") + ";"}
		}`;
	document.head.insertBefore(styleTag, _("mainStylesheet"));



	const storedSettings = await browser.storage.local.get() || {};
	storedSettings.sv = 2;

	setDefaults(storedSettings);
	initUIValues(storedSettings);

	await browser.storage.local.set(storedSettings);          //save defaults & keys
})().catch(setErrorState)




function setDefaults(storage){
	if(!storage.hasOwnProperty("webhookURL"))                                storage.webhookURL = "";
	if(!storage.hasOwnProperty("sendAs"))                                    storage.sendAs = (_("sendAsEmbed").checked ? "embed" : "text");
	if(!storage.hasOwnProperty("sendOnDBClick"))                             storage.sendOnDBClick = _("sendOnDBClick").checked;
	if(!storage.hasOwnProperty("sendOnView"))                                storage.sendOnView = _("sendOnView").checked;
	if(!storage.hasOwnProperty("sendUsername"))                              storage.sendUsername = _("sendUsername").checked;
	if(!storage.hasOwnProperty("rememberPostHistory"))                       storage.rememberPostHistory = document.querySelector("[name='rememberPostHistoryRadio']:checked")?.value || "permanently";

	if(!storage.hasOwnProperty("advSet_sendbtn_clrs_btnBaseColorCustom"))    storage.advSet_sendbtn_clrs_btnBaseColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnBaseColorCustom").value) || _("advSet_sendbtn_clrs_btnBaseColorCustom").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_sendbtn_clrs_btnPressedColorCustom")) storage.advSet_sendbtn_clrs_btnPressedColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnPressedColorCustom").value) || _("advSet_sendbtn_clrs_btnPressedColorCustom").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_sendbtn_clrs_btnSentColorCustom"))    storage.advSet_sendbtn_clrs_btnSentColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnSentColorCustom").value) || _("advSet_sendbtn_clrs_btnSentColorCustom").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_sendbtn_clrs_btnTextColorCustom"))    storage.advSet_sendbtn_clrs_btnTextColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnTextColorCustom").value) || _("advSet_sendbtn_clrs_btnTextColorCustom").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_sendbtn_baseText"))                   storage.advSet_sendbtn_baseText = _("advSet_sendbtn_baseText").value || _("advSet_sendbtn_baseText").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_sendbtn_baseTextSent"))               storage.advSet_sendbtn_baseTextSent = _("advSet_sendbtn_baseTextSent").value || _("advSet_sendbtn_baseTextSent").getAttribute("data-defval");
	

	if(!storage.hasOwnProperty("advSet_webhook_displayname"))                storage.advSet_webhook_displayname = _("advSet_webhook_displayname").value || _("advSet_webhook_displayname").getAttribute("data-defval");
	if(!storage.hasOwnProperty("advSet_webhook_displayColor")){
		const checked = (_("advSet_webhook_colorSelector_default").checked ? "default" : _("advSet_webhook_colorSelector_random").checked ? "random" : _("advSet_webhook_colorSelector_custom").checked ? "custom" : "default");
		let val = checked;

		if(checked == "custom"){
			_("advSet_webhook_colorSelector_custom_input").disabled = false;
			val = _("advSet_webhook_colorSelector_custom_input").value;
		}
		else _("advSet_webhook_colorSelector_custom_input").disabled = true;
		storage.advSet_webhook_displayColor = val;
	} 
}


function initUIValues(storage){
	_("webhookURL").value =                                                  storage.webhookURL;
	_("sendAsEmbed").checked =                                               storage.sendAs === "embed";
	_("sendAsText").checked =                                                storage.sendAs === "text";
	_("sendOnDBClick").checked =                                             storage.sendOnDBClick;
	_("sendOnView").checked =                                                storage.sendOnView;
	_("sendUsername").checked =                                              storage.sendUsername;

	document.querySelectorAll("[name='rememberPostHistoryRadio']").forEach(e => e.checked = false);
	document.querySelector("[name='rememberPostHistoryRadio'][value='" + storage.rememberPostHistory + "']").checked = true;
	
	_("advSet_sendbtn_clrs_btnBaseColorCustom").value =                      storage.advSet_sendbtn_clrs_btnBaseColorCustom;
	_("advSet_sendbtn_clrs_btnPressedColorCustom").value =                   storage.advSet_sendbtn_clrs_btnPressedColorCustom;
	_("advSet_sendbtn_clrs_btnSentColorCustom").value =                      storage.advSet_sendbtn_clrs_btnSentColorCustom;
	_("advSet_sendbtn_clrs_btnTextColorCustom").value =                      storage.advSet_sendbtn_clrs_btnTextColorCustom;
	_("advSet_sendbtn_baseText").value =                                     storage.advSet_sendbtn_baseText;
	_("advSet_sendbtn_baseTextSent").value =                                 storage.advSet_sendbtn_baseTextSent;

	_("advSet_webhook_displayname").value =                                  storage.advSet_webhook_displayname;
	_("advSet_webhook_colorSelector_default").checked =                      storage.advSet_webhook_displayColor === "default";
	_("advSet_webhook_colorSelector_random").checked =                       storage.advSet_webhook_displayColor === "random";

	if(storage.advSet_webhook_displayColor !== "default" && storage.advSet_webhook_displayColor !== "random"){
		_("advSet_webhook_colorSelector_custom").checked = true;
		_("advSet_webhook_colorSelector_custom_input").disabled = false;
		_("advSet_webhook_colorSelector_custom_input").value =               storage.advSet_webhook_displayColor;
	}
}




function checkHexColorValidity(hex){
	return /^#([0-9a-f]{3}){1,2}$/i.test(hex) ? hex : null;
}


function registerListeners(...inputData){
	inputData.forEach(([id, listener, prop]) => {
		_(id).addEventListener(listener, (e) => {
			e.target.disabled = true;
			
			browser.storage.local.set({[id]: e.target[prop]})
			.then(() => {e.target.disabled = false})
			.catch(setErrorState);
		});
	});
}



function openConfirmationBox(title, body, onClose){
	if(!title || !body || !onClose) throw new Error("openConfirmationBox requires exactly 3 arguments!");
	if(typeof title !== "string") throw new TypeError("openConfirmationBox > title must be of type String, got: " + typeof title);
	if(typeof body !== "string") throw new TypeError("openConfirmationBox > body must be of type String, got: " + typeof body);
	if(typeof onClose !== "function") throw new TypeError("openConfirmationBox > onClose must be of type Function, got: " + typeof onClose);

	if(_("popup_confirmation_fader").style.display == "block") return false;
	_("popup_confirmation_fader").style.display = "block";

	_("popup_confirmation_body_header").innerText = title;
	_("popup_confirmation_body_text").innerText = body;


	const onBtnClick = (e) => {
		_("popup_confirmation_cancel_btn").removeEventListener("click", onBtnClick);
		_("popup_confirmation_confirm_btn").removeEventListener("click", onBtnClick);

		_("popup_confirmation_fader").style.display = "none";
		onClose((e.target.id == "popup_confirmation_confirm_btn"));
	}
	_("popup_confirmation_cancel_btn").addEventListener("click", onBtnClick);
	_("popup_confirmation_confirm_btn").addEventListener("click", onBtnClick);
	return true;
}

function hyperlinkConfirmation(elemID, confrimText, endText, onAction){
	if(!elemID || !confrimText || !endText || !onAction) throw new Error("hyperlinkConfirmation requires exactly 4 arguments!");
	if(typeof elemID !== "string") throw new TypeError("hyperlinkConfirmation > elemID must be of type String, got: " + typeof elemID);
	if(typeof confrimText !== "string") throw new TypeError("hyperlinkConfirmation > confrimText must be of type String, got: " + typeof confrimText);
	if(typeof endText !== "string") throw new TypeError("hyperlinkConfirmation > endText must be of type String, got: " + typeof endText);
	if(typeof onAction !== "function") throw new TypeError("hyperlinkConfirmation > onAction must be of type Function, got: " + typeof onAction);

	if(!_(elemID).getAttribute("data-hc-ccs") || _(elemID).getAttribute("data-hc-ccs") == "init"){
		_(elemID).innerText = confrimText;
		_(elemID).setAttribute("data-hc-ccs", "ctc");
	}
	else if(_(elemID).getAttribute("data-hc-ccs") == "ctc"){
		_(elemID).innerText = endText;
		_(elemID).setAttribute("data-hc-ccs", "end");
		onAction();
	}
}



/*===================== UI event Listeners =====================*/

registerListeners(
	["webhookURL", "change", "value"],
	["sendOnDBClick", "click", "checked"],
	["sendOnView", "click", "checked"],
	["sendUsername", "click", "checked"],
	["advSet_sendbtn_clrs_btnBaseColorCustom", "change", "value"],
	["advSet_sendbtn_clrs_btnPressedColorCustom", "change", "value"],
	["advSet_sendbtn_clrs_btnSentColorCustom", "change", "value"],
	["advSet_sendbtn_clrs_btnTextColorCustom", "change", "value"],
	["advSet_sendbtn_baseText", "change", "value"],
	["advSet_sendbtn_baseTextSent", "change", "value"],
	["advSet_webhook_displayname", "change", "value"]
);



const onSendAsChange = (e) => {
	_("sendAsEmbed").disabled = true;
	_("sendAsText").disabled = true;

	browser.storage.local.set({sendAs: e.target.value})
	.then(() => {
		_("sendAsEmbed").disabled = false;
		_("sendAsText").disabled = false;
	})
	.catch(setErrorState);
}
_("sendAsEmbed").addEventListener("click", onSendAsChange);
_("sendAsText").addEventListener("click", onSendAsChange);


const onRememberHistoryChange = (e) => {
	_("rememberPostHistory_permanently").disabled = true;
	_("rememberPostHistory_session").disabled = true;
	_("rememberPostHistory_off").disabled = true;

	browser.storage.local.set({rememberPostHistory: e.target.value})
	.then(() => {
		_("rememberPostHistory_permanently").disabled = false;
	_("rememberPostHistory_session").disabled = false;
	_("rememberPostHistory_off").disabled = false;
	})
	.catch(setErrorState);
}
_("rememberPostHistory_permanently").addEventListener("click", onRememberHistoryChange);
_("rememberPostHistory_session").addEventListener("click", onRememberHistoryChange)
_("rememberPostHistory_off").addEventListener("click", onRememberHistoryChange)


const onWebhookClrChange = (e) => {
	_("advSet_webhook_colorSelector_default").disabled = true;
	_("advSet_webhook_colorSelector_random").disabled = true;
	_("advSet_webhook_colorSelector_custom").disabled = true;

	let val = "default";


	_("advSet_webhook_colorSelector_custom_input").disabled = true;
	val = e.target.value

	if(e.target.value == "custom"){
		_("advSet_webhook_colorSelector_custom_input").disabled = false;
		val = checkHexColorValidity(_("advSet_webhook_colorSelector_custom_input").value) ? _("advSet_webhook_colorSelector_custom_input").value : "default";
	}


	browser.storage.local.set({advSet_webhook_displayColor: val})
	.then(() => {
		_("advSet_webhook_colorSelector_default").disabled = false;
		_("advSet_webhook_colorSelector_random").disabled = false;
		_("advSet_webhook_colorSelector_custom").disabled = false;
	})
	.catch(setErrorState);
}
_("advSet_webhook_colorSelector_default").addEventListener("click", onWebhookClrChange);
_("advSet_webhook_colorSelector_random").addEventListener("click", onWebhookClrChange);
_("advSet_webhook_colorSelector_custom").addEventListener("click", onWebhookClrChange);



_("advSet_webhook_colorSelector_custom_input").addEventListener("change", (e) => {
	e.target.disabled = true;
	if(!_("advSet_webhook_colorSelector_custom").checked) return;

	if(checkHexColorValidity(e.target.value)){
		browser.storage.local.set({advSet_webhook_displayColor: e.target.value})
		.then(() => {e.target.disabled = false})
		.catch(setErrorState);
	}
	else{
		e.target.disabled = false;
		e.target.value = _("advSet_webhook_colorSelector_custom_input").getAttribute("data-defval")
		_("advSet_webhook_colorSelector_default").click();
	}
});








_("rememberPostHistory_permanently_deleteStorage").addEventListener("click", (e) => {
	hyperlinkConfirmation("rememberPostHistory_permanently_deleteStorage", "Are you sure?", "History deleted.", () => {
		browser.storage.local.set({flags_delete_history: true})
		.catch(setErrorState);
	})
});

_("advSet_sendbtn_clrs_defreset").addEventListener("click", (e) => {
	hyperlinkConfirmation("advSet_sendbtn_clrs_defreset", "Are you sure?", "Defaults loaded.", () => {
		_("advSet_sendbtn_clrs_btnBaseColorCustom").value = _("advSet_sendbtn_clrs_btnBaseColorCustom").getAttribute("data-defval");
		_("advSet_sendbtn_clrs_btnPressedColorCustom").value = _("advSet_sendbtn_clrs_btnPressedColorCustom").getAttribute("data-defval");
		_("advSet_sendbtn_clrs_btnSentColorCustom").value = _("advSet_sendbtn_clrs_btnSentColorCustom").getAttribute("data-defval");
		_("advSet_sendbtn_clrs_btnTextColorCustom").value = _("advSet_sendbtn_clrs_btnTextColorCustom").getAttribute("data-defval");

		_("advSet_sendbtn_clrs_btnBaseColorCustom").dispatchEvent(new Event("change"));
		_("advSet_sendbtn_clrs_btnPressedColorCustom").dispatchEvent(new Event("change"));
		_("advSet_sendbtn_clrs_btnSentColorCustom").dispatchEvent(new Event("change"));
		_("advSet_sendbtn_clrs_btnTextColorCustom").dispatchEvent(new Event("change"));
	});
});


_("advSet_sendbtn_defreset").addEventListener("click", (e) => {
	hyperlinkConfirmation("advSet_sendbtn_defreset", "Are you sure?", "Defaults loaded.", () => {
		_("advSet_sendbtn_baseText").value = _("advSet_sendbtn_baseText").getAttribute("data-defval");
		_("advSet_sendbtn_baseTextSent").value = _("advSet_sendbtn_baseTextSent").getAttribute("data-defval");

		_("advSet_sendbtn_baseText").dispatchEvent(new Event("change"));
		_("advSet_sendbtn_baseTextSent").dispatchEvent(new Event("change"));
	});
});


_("advSet_webhook_defreset").addEventListener("click", (e) => {
	hyperlinkConfirmation("advSet_webhook_defreset", "Are you sure?", "Defaults loaded.", () => {
		_("advSet_webhook_displayname").value = _("advSet_webhook_displayname").getAttribute("data-defval");

		_("advSet_webhook_displayname").dispatchEvent(new Event("change"));
		_("advSet_webhook_colorSelector_default").click();
	});
});