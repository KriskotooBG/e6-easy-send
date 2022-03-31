
const _ = (id) => {return document.getElementById(id)}
const setErrorState = (msg, clr = "#ad2626") => {document.body.style.backgroundColor = clr; document.body.innerHTML = msg + "<br>" + (msg?.stack || "")} 






(async () => {
	const curTheme = await browser.theme.getCurrent() || null;
	if(curTheme && curTheme.colors){
		const styleTag = document.createElement("style");
		styleTag.innerHTML = 
			`
			body{
				${curTheme.colors.popup_text ? "color: " + curTheme.colors.popup_text + ";": ""}
				${curTheme.colors.popup ? "background-color: " + curTheme.colors.popup + ";": ""}
			}
			input[type="text"], input[type="url"]{
				${curTheme.colors.input_color ? "color: " + curTheme.colors.input_color + ";" : ""}
				${curTheme.colors.input_background ? "background-color: " + curTheme.colors.input_background + ";" : ""}
				${curTheme.colors.input_border ? "border-color: " + curTheme.colors.input_border + ";" : ""}
			}
			`;
		document.head.appendChild(styleTag);
	}


	const storedSettings = await browser.storage.local.get() || {};

	if(!storedSettings.hasOwnProperty("sv")) storedSettings.sv = 1;

	if(!storedSettings.hasOwnProperty("webhookURL")) storedSettings.webhookURL = "";
	if(!storedSettings.hasOwnProperty("sendAs")) storedSettings.sendAs = (_("sendAsEmbed").checked ? "embed" : "text");
	if(!storedSettings.hasOwnProperty("sendOnDBClick")) storedSettings.sendOnDBClick = _("sendOnDBClick").checked;
	if(!storedSettings.hasOwnProperty("sendOnView")) storedSettings.sendOnView = _("sendOnView").checked;
	if(!storedSettings.hasOwnProperty("sendUsername")) storedSettings.sendUsername = _("sendUsername").checked;

	if(!storedSettings.hasOwnProperty("advSet_sendbtn_clrs_btnBaseColorCustom")) storedSettings.advSet_sendbtn_clrs_btnBaseColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnBaseColorCustom").value) || _("advSet_sendbtn_clrs_btnBaseColorCustom").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_sendbtn_clrs_btnPressedColorCustom")) storedSettings.advSet_sendbtn_clrs_btnPressedColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnPressedColorCustom").value) || _("advSet_sendbtn_clrs_btnPressedColorCustom").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_sendbtn_clrs_btnSentColorCustom")) storedSettings.advSet_sendbtn_clrs_btnSentColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnSentColorCustom").value) || _("advSet_sendbtn_clrs_btnSentColorCustom").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_sendbtn_clrs_btnTextColorCustom")) storedSettings.advSet_sendbtn_clrs_btnTextColorCustom = checkHexColorValidity(_("advSet_sendbtn_clrs_btnTextColorCustom").value) || _("advSet_sendbtn_clrs_btnTextColorCustom").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_sendbtn_baseText")) storedSettings.advSet_sendbtn_baseText = _("advSet_sendbtn_baseText").value || _("advSet_sendbtn_baseText").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_sendbtn_baseTextSent")) storedSettings.advSet_sendbtn_baseTextSent = _("advSet_sendbtn_baseTextSent").value || _("advSet_sendbtn_baseTextSent").getAttribute("data-defval");
	

	if(!storedSettings.hasOwnProperty("advSet_webhook_displayname")) storedSettings.advSet_webhook_displayname = _("advSet_webhook_displayname").value || _("advSet_webhook_displayname").getAttribute("data-defval");
	if(!storedSettings.hasOwnProperty("advSet_webhook_displayColor")){
		const checked = (_("advSet_webhook_colorSelector_default").checked ? "default" : _("advSet_webhook_colorSelector_random").checked ? "random" : _("advSet_webhook_colorSelector_custom").checked ? "custom" : "default");
		let val = checked;

		if(checked == "custom"){
			_("advSet_webhook_colorSelector_custom_input").disabled = false;
			val = _("advSet_webhook_colorSelector_custom_input").value;
		}
		else _("advSet_webhook_colorSelector_custom_input").disabled = true;
		storedSettings.advSet_webhook_displayColor = val;
	} 
	
	
	_("webhookURL").value = storedSettings.webhookURL;
	_("sendAsEmbed").checked = (storedSettings.sendAs === "embed");
	_("sendAsText").checked = (storedSettings.sendAs === "text");
	_("sendOnDBClick").checked = storedSettings.sendOnDBClick;
	_("sendOnView").checked = storedSettings.sendOnView;
	_("sendUsername").checked = storedSettings.sendUsername;
	
	_("advSet_sendbtn_clrs_btnBaseColorCustom").value = storedSettings.advSet_sendbtn_clrs_btnBaseColorCustom;
	_("advSet_sendbtn_clrs_btnPressedColorCustom").value = storedSettings.advSet_sendbtn_clrs_btnPressedColorCustom;
	_("advSet_sendbtn_clrs_btnSentColorCustom").value = storedSettings.advSet_sendbtn_clrs_btnSentColorCustom;
	_("advSet_sendbtn_clrs_btnTextColorCustom").value = storedSettings.advSet_sendbtn_clrs_btnTextColorCustom;
	_("advSet_sendbtn_baseText").value = storedSettings.advSet_sendbtn_baseText;
	_("advSet_sendbtn_baseTextSent").value = storedSettings.advSet_sendbtn_baseTextSent;

	_("advSet_webhook_displayname").value = storedSettings.advSet_webhook_displayname;
	_("advSet_webhook_colorSelector_default").checked = (storedSettings.advSet_webhook_displayColor === "default");
	_("advSet_webhook_colorSelector_random").checked = (storedSettings.advSet_webhook_displayColor === "random");
	if(storedSettings.advSet_webhook_displayColor !== "default" && storedSettings.advSet_webhook_displayColor !== "random"){
		_("advSet_webhook_colorSelector_custom").checked = true;
		_("advSet_webhook_colorSelector_custom_input").disabled = false;
		_("advSet_webhook_colorSelector_custom_input").value = storedSettings.advSet_webhook_displayColor;
	}



	await browser.storage.local.set(storedSettings);          //save defaults & keys
})().catch(setErrorState)






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








_("advSet_sendbtn_clrs_defreset").addEventListener("click", (e) => {
	_("advSet_sendbtn_clrs_btnBaseColorCustom").value = _("advSet_sendbtn_clrs_btnBaseColorCustom").getAttribute("data-defval");
	_("advSet_sendbtn_clrs_btnPressedColorCustom").value = _("advSet_sendbtn_clrs_btnPressedColorCustom").getAttribute("data-defval");
	_("advSet_sendbtn_clrs_btnSentColorCustom").value = _("advSet_sendbtn_clrs_btnSentColorCustom").getAttribute("data-defval");
	_("advSet_sendbtn_clrs_btnTextColorCustom").value = _("advSet_sendbtn_clrs_btnTextColorCustom").getAttribute("data-defval");

	_("advSet_sendbtn_clrs_btnBaseColorCustom").dispatchEvent(new Event("change"));
	_("advSet_sendbtn_clrs_btnPressedColorCustom").dispatchEvent(new Event("change"));
	_("advSet_sendbtn_clrs_btnSentColorCustom").dispatchEvent(new Event("change"));
	_("advSet_sendbtn_clrs_btnTextColorCustom").dispatchEvent(new Event("change"));
});


_("advSet_sendbtn_defreset").addEventListener("click", (e) => {
	_("advSet_sendbtn_baseText").value = _("advSet_sendbtn_baseText").getAttribute("data-defval");
	_("advSet_sendbtn_baseTextSent").value = _("advSet_sendbtn_baseTextSent").getAttribute("data-defval");

	_("advSet_sendbtn_baseText").dispatchEvent(new Event("change"));
	_("advSet_sendbtn_baseTextSent").dispatchEvent(new Event("change"));
});


_("advSet_webhook_defreset").addEventListener("click", (e) => {
	_("advSet_webhook_displayname").value = _("advSet_webhook_displayname").getAttribute("data-defval");

	_("advSet_webhook_displayname").dispatchEvent(new Event("change"));
	_("advSet_webhook_colorSelector_default").click();
});