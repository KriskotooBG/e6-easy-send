/*
*   _____ __     _____                  ____                 _ 
*  | ____/ /_   | ____|__ _ ___ _   _  / ___|  ___ _ __   __| |
*  |  _|| '_ \  |  _| / _` / __| | | | \___ \ / _ \ '_ \ / _` |
*  | |__| (_) | | |__| (_| \__ \ |_| |  ___) |  __/ | | | (_| |
*  |_____\___/  |_____\__,_|___/\__, | |____/ \___|_| |_|\__,_|
*                               |___/                          
*
* E6 easy send -  The easy way to send posts to Discord
* Color picker logic file.
*
* Copyright (c) 2022 Chris G.
*/

/** @type {HTMLCanvasElement} */
const mainCanv = document.getElementById("popupColorPickerCanvMain");
const mainCtx = mainCanv.getContext("2d");

/** @type {HTMLCanvasElement} */
const clrSelCanv = document.getElementById("popupColorPickerCanvColor");
const clrSelCtx = clrSelCanv.getContext("2d");

/** @type {HTMLCanvasElement} */
const alpSelCanv = document.getElementById("popupColorPickerCanvAlpha");
const alpSelCtx = alpSelCanv.getContext("2d");



mainCanv.width = parseInt(getComputedStyle(mainCanv).width);
mainCanv.height = parseInt(getComputedStyle(mainCanv).height);

clrSelCanv.width = parseInt(getComputedStyle(clrSelCanv).width);
clrSelCanv.height = parseInt(getComputedStyle(clrSelCanv).height);

alpSelCanv.width = parseInt(getComputedStyle(alpSelCanv).width);
alpSelCanv.height = parseInt(getComputedStyle(alpSelCanv).height);




const mainBoxDarkGradient = mainCtx.createLinearGradient(0, 0, 0, mainCanv.height);
mainBoxDarkGradient.addColorStop(0, "#00000000");
mainBoxDarkGradient.addColorStop(1, "#000000FF");

const mainBoxLightGradient = mainCtx.createLinearGradient(0, 0, mainCanv.width, 0);
mainBoxLightGradient.addColorStop(0, "#FFFFFFFF");
mainBoxLightGradient.addColorStop(1, "#FFFFFF00");

const colorStripColorGradient = clrSelCtx.createLinearGradient(0, 0, 0, clrSelCanv.height);
colorStripColorGradient.addColorStop(0,    "#FF0000");
colorStripColorGradient.addColorStop(0.17, "#FFFF00");
colorStripColorGradient.addColorStop(0.34, "#00FF00");
colorStripColorGradient.addColorStop(0.51, "#00FFFF");
colorStripColorGradient.addColorStop(0.68, "#0000FF");
colorStripColorGradient.addColorStop(0.85, "#FF00FF");
colorStripColorGradient.addColorStop(1,    "#FF0000");


const _ri = document.getElementById("popupColorPickerValInpR");
const _gi = document.getElementById("popupColorPickerValInpG");
const _bi = document.getElementById("popupColorPickerValInpB");
const _ai = document.getElementById("popupColorPickerValInpA");
const _hi = document.getElementById("popupColorPickerValInpHEX");

const curInteraction = {
	colorSelBlock: false,
	colorSelBar: false,
	alphaSelBar: false,

	resetAll: () => {curInteraction.colorSelBlock = false; curInteraction.colorSelBar = false; curInteraction.alphaSelBar = false;},
	resetDefaults: () => {curInteraction.resetAll()}
};
const curSelPos = {
	x: mainCanv.width - 10,
	y: 15,
	colorStripY: 0,
	alphaStripY: 0,

	resetDefaults: () => {curSelPos.x = mainCanv.width - 10; curSelPos.y = 15; curSelPos.colorStripY = 0, curSelPos.alphaStripY = 0}
}

const baseColor = {
	R: 255,
	G: 0,
	B: 0,

	setMultiple: (...values) => {if(values.length > 3) throw new TypeError("e6EasySend: Got unexpected color value length. (A1)"); let k = ["R", "G", "B"]; values.forEach((p, i) => {baseColor[k[i]] = p})},
	resetDefaults: () => {baseColor.setMultiple(255, 0, 0)}
	
}
const selectedColor = {
	R: 0,
	G: 0,
	B: 0,
	A: 0,

	setMultiple: (...values) => {if(values.length > 4) throw new TypeError("e6EasySend: Got unexpected color value length. (A2)"); let k = ["R", "G", "B", "A"]; values.forEach((p, i) => {selectedColor[k[i]] = p})},
	resetDefaults: () => {selectedColor.setMultiple(0, 0, 0, 0)}
}

let isOpen = false;
let activeSelectorBTNID = "";









onBlockColorSelection();   //calling this method instead of draw, to do initial color selection.
drawColorSelectStrip();		//no other init methods are required as onBlockColorSelection() calls everything needed to begin.










function drawGrayOverlayOverAllCanvSelectors(){
	drawColorSelectorBox();
	mainCtx.fillStyle = "#4A4A4A90";
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	drawColorSelectStrip();
	clrSelCtx.fillStyle = "#4A4A4A90";
	clrSelCtx.fillRect(0, 0, clrSelCanv.width, clrSelCanv.height);

	drawColorAlphaSelectStrip();
	alpSelCtx.fillStyle = "#4A4A4A90";
	alpSelCtx.fillRect(0, 0, alpSelCanv.width, alpSelCanv.height);
}






function drawColorSelectorBox(){
	mainCtx.clearRect(0, 0, mainCanv.width, mainCanv.height);


	mainCtx.fillStyle = RGBAToHEX(baseColor.R, baseColor.G, baseColor.B);
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = mainBoxLightGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = mainBoxDarkGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	// --------------- thumb ------------ //
	mainCtx.beginPath();
	mainCtx.strokeStyle = (0.2126 * selectedColor.R + 0.7152 * selectedColor.G + 0.0722 * selectedColor.B) > 128 ? "#000000AA" : "#FFFFFFAA";
	mainCtx.arc(curSelPos.x, curSelPos.y, 3, 0, Math.PI * 2);
	mainCtx.stroke();
}



function drawColorSelectStrip(){
	clrSelCtx.clearRect(0, 0, clrSelCanv.width, clrSelCanv.height);

	clrSelCtx.beginPath();
	clrSelCtx.rect(0, 0, clrSelCanv.width, clrSelCanv.height);
	clrSelCtx.fillStyle = colorStripColorGradient;
	clrSelCtx.fill();

	clrSelCtx.beginPath();
	clrSelCtx.strokeStyle = "#000000AA";
	clrSelCtx.rect(1, curSelPos.colorStripY - 2, clrSelCanv.width - 2, 4);
	clrSelCtx.stroke();
}



function drawColorAlphaSelectStrip(fromHexField = false){
	const transpGradient = alpSelCtx.createLinearGradient(0, 0, 0, alpSelCanv.height);
	if(fromHexField){
		transpGradient.addColorStop(0, (_hi.value.length == 7 ? _hi.value : _hi.value.slice(0, -2)) + "FF");
		transpGradient.addColorStop(1, (_hi.value.length == 7 ? _hi.value : _hi.value.slice(0, -2)) + "00");
	}
	else{
		transpGradient.addColorStop(0, RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B) + "FF");
		transpGradient.addColorStop(1, RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B) + "00");
	}

	alpSelCtx.clearRect(0, 0, alpSelCanv.width, alpSelCanv.height);

	alpSelCtx.beginPath();
	alpSelCtx.rect(0, 0, alpSelCanv.width, alpSelCanv.height);
	alpSelCtx.fillStyle = transpGradient;
	alpSelCtx.fill();

	alpSelCtx.beginPath();
	if(fromHexField){
		const rgba = HEXToRGBA(_hi.value);
		alpSelCtx.strokeStyle = (0.2126 * rgba[0] + 0.7152 * rgba[1] + 0.0722 * rgba[2]) > 128 ? "#000000AA" : "#FFFFFFAA";
	}
	else alpSelCtx.strokeStyle = (0.2126 * selectedColor.R + 0.7152 * selectedColor.G + 0.0722 * selectedColor.B) > 128 ? "#000000AA" : "#FFFFFFAA";
	alpSelCtx.rect(1, curSelPos.alphaStripY - 2, alpSelCanv.width - 2, 4);
	alpSelCtx.stroke();
}





function onBaseColorChange(e, upd = false){
	if(e.clientY === undefined && !upd) return;

	if(!upd){
		const boundingBox = clrSelCanv.getBoundingClientRect();
		curSelPos.colorStripY = (e.clientY - boundingBox.top) > clrSelCanv.height ? clrSelCanv.height - 1 : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top);
	}

	drawColorSelectStrip();

	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we check the Y position + some rounding to give a solid color stop on the base values.
	switch(Math.round(((clrSelCanv.height == curSelPos.colorStripY + 1 ? clrSelCanv.height : curSelPos.colorStripY) / clrSelCanv.height) * 100)){
		case 0: case 1:				baseColor.setMultiple(255, 0, 0);	break;
		case 16: case 17: case 18:	baseColor.setMultiple(255, 255, 0);	break;
		case 33: case 34: case 35:	baseColor.setMultiple(0, 255, 0);	break;
		case 50: case 51: case 52:	baseColor.setMultiple(0, 255, 255);	break;
		case 67: case 68: case 69:	baseColor.setMultiple(0, 0, 255);	break;
		case 84: case 85: case 86:	baseColor.setMultiple(255, 0, 255);	break;
		case 99: case 100:			baseColor.setMultiple(255, 0, 0);	break;
		default:
			const clrData = clrSelCtx.getImageData((clrSelCanv.width / 2), curSelPos.colorStripY, 1, 1).data;
			baseColor.setMultiple(clrData[0], clrData[1], clrData[2]);
			break;
	}
	

	if(!upd) onBlockColorSelection();
}


function onBlockColorSelection(){
	drawColorSelectorBox();


	const clrData = mainCtx.getImageData(curSelPos.x, curSelPos.y, 1, 1).data;

	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we round up primary color values like R, G, B, C, Y, P, W etc.
	const _R = 3;
	clrData[0] = (clrData[0] + _R >= 255) ? 255 : (clrData[0] - _R <= 0) ? 0 : clrData[0];
	clrData[1] = (clrData[1] + _R >= 255) ? 255 : (clrData[1] - _R <= 0) ? 0 : clrData[1];
	clrData[2] = (clrData[2] + _R >= 255) ? 255 : (clrData[2] - _R <= 0) ? 0 : clrData[2];
	
	if(curSelPos.x == 0) clrData[0] = clrData[1] = clrData[2] = Math.max(clrData[0], clrData[1], clrData[2]) //make left-most side have equal values.

	
	
	_ri.value = clrData[0];
	_gi.value = clrData[1];
	_bi.value = clrData[2];

	selectedColor.setMultiple(clrData[0], clrData[1], clrData[2]);


	onAlphaSelection();
}
function onBlockColorChange(e){
	if(e.clientY === undefined || e.clientX === undefined) return;

	const boundingBox = mainCanv.getBoundingClientRect();
	const offsetX = Math.round((e.clientX - boundingBox.left) > mainCanv.width ? mainCanv.width - 1 : (e.clientX - boundingBox.left) < 0 ? 0 : (e.clientX - boundingBox.left));
	const offsetY = Math.round((e.clientY - boundingBox.top) > mainCanv.height ? mainCanv.height - 1 : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top));

	curSelPos.x = offsetX;
	curSelPos.y = offsetY;

	onBlockColorSelection();
}




function onAlphaChange(e){
	if(e.clientY === undefined) return;

	const boundingBox = alpSelCanv.getBoundingClientRect();
	curSelPos.alphaStripY = (e.clientY - boundingBox.top) > alpSelCanv.height ? alpSelCanv.height : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top);

	onAlphaSelection();
}

function onAlphaSelection(){
	drawColorAlphaSelectStrip();

	const clrData = alpSelCtx.getImageData((alpSelCanv.width / 2), curSelPos.alphaStripY, 1, 1).data;
	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we round up primary color values like R, G, B, C, Y, P, W etc.
	const _R = 3;
	clrData[3] = (clrData[3] + _R >= 255) ? 255 : (clrData[3] - _R <= 0) ? 0 : clrData[3];
	
	selectedColor.A = clrData[3];

	_ai.value = clrData[3];
	_hi.value = RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);
	document.getElementById("popupColorPickerResultPreview").style.setProperty("--clr_picker_bgcolor", RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A))
}





function onManualColorInput(fromHex = false){
	if(fromHex){
		_ri.value = selectedColor.R;
		_gi.value = selectedColor.G;
		_bi.value = selectedColor.B;
		_ai.value = selectedColor.A;
	}
	else _hi.value = RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);

	temp_SetThumbsFromRGBA(selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A);

	document.getElementById("popupColorPickerResultPreview").style.setProperty("--clr_picker_bgcolor", RGBAToHEX(selectedColor.R, selectedColor.G, selectedColor.B, selectedColor.A));
}



//I am terribly sorry about the crimes commited in this function.
//I am way too tired and annoyed with the 2D drawing contect API, and how innacurate It's color gradients are.
//So, for the time being, this is the best I'll do.
function temp_SetThumbsFromRGBA(r, g, b, a){
	const v = RGBToHSV(r, g, b);
	

	curSelPos.x = (Math.max((Math.round(v[1] * mainCanv.width) - 1), 0));
	curSelPos.y = mainCanv.height - Math.round(v[2] * mainCanv.height);
	curSelPos.colorStripY = Math.round((v[0] / 360) * clrSelCanv.height);
	curSelPos.alphaStripY = alpSelCanv.height - Math.round((a / 255) * alpSelCanv.height);

	onBaseColorChange({}, true);
	drawColorSelectorBox();
	drawColorAlphaSelectStrip(true);
}



function openColorPickerPopup(initClr = null){
	if(isOpen) return false;
	

	_ri.value = _gi.value = _bi.value = _ai.value = _hi.value = "0";

	curInteraction.resetDefaults();
	curSelPos.resetDefaults();
	baseColor.resetDefaults();
	selectedColor.resetDefaults();


	if(initClr === null){
		onBlockColorSelection();	//calling this method instead of draw, to do initial color selection.
		drawColorSelectStrip();		//no other init methods are required as onBlockColorSelection() calls everything needed to begin.
	}
	else{
		_hi.value = initClr;
		document.getElementById("popupColorPickerResultPreview").style.setProperty("--clr_picker_bgcolor", initClr);
		temp_SetThumbsFromRGBA(...HEXToRGBA(initClr));
	}


	document.getElementById("popupColorPicker_fader").style.display = "block";
	isOpen = true;
}









function RGBAToHEX(r,g,b,a){
	return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0") + (a !== undefined ? a.toString(16).padStart(2, "0") : "");
}
function CSS_RGBAToHEX(rgba){							//function from https://stackoverflow.com/a/3627747
	try{
		return "#" + rgba.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/)
					.slice(1)
					.map((v, i) => {
						return (i == 3 ? Math.round(parseFloat(v) * 255) : parseFloat(v))
						.toString(16)
						.padStart(2, "0")
						.replace("NaN", "")
					}).join("");
	} catch(e){return null}
}
function HEXToRGBA(hex){
	if(hex.length != 7 && hex.length != 9) return [0, 0, 0, 0];

	const x = hex.substring(1);
	if(x.length == 6) return [parseInt(x[0] + x[1], 16), parseInt(x[2] + x[3], 16), parseInt(x[4] + x[5], 16), 0];
	else if(x.length == 8) return [parseInt(x[0] + x[1], 16), parseInt(x[2] + x[3], 16), parseInt(x[4] + x[5], 16), parseInt(x[6] + x[7], 16)];
	return [0, 0, 0, 0];
}
function RGBToHSV(r, g, b){			//Function from https://stackoverflow.com/a/54070620
	r /= 255, g /= 255, b/= 255;

	let v = Math.max(r, g, b);
	let c = v - Math.min(r, g, b);
	let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r-g) / c));

	return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}










let __mouseDownOnFader = false;
document.getElementById("popupColorPicker_fader").addEventListener("mousedown", (e) => {
	switch(e.target.id){
		case "popupColorPicker_fader":
			__mouseDownOnFader = true;
			break;
		case "popupColorPickerCanvMain":
			__mouseDownOnFader = false;
			curInteraction.colorSelBlock = true;
			onBlockColorChange(e);
			break;
		case "popupColorPickerCanvColor":
			__mouseDownOnFader = false;
			curInteraction.colorSelBar = true;
			onBaseColorChange(e);
			break;
		case "popupColorPickerCanvAlpha":
			__mouseDownOnFader = false;
			curInteraction.alphaSelBar = true;
			break;

		default:
			__mouseDownOnFader = false;
			curInteraction.resetAll();
			break;
	}
});
document.getElementById("popupColorPicker_fader").addEventListener("mouseup", (e) => {
	if(__mouseDownOnFader && e.target.id == "popupColorPicker_fader"){
		document.getElementById(activeSelectorBTNID).style.backgroundColor = _hi.value;
		document.getElementById(activeSelectorBTNID).dispatchEvent(new CustomEvent("colorupdate", {detail: _hi.value}))

		document.getElementById("popupColorPicker_fader").style.display = "none";
		isOpen = false;
		__mouseDownOnFader = false;
		return;
	}

	__mouseDownOnFader = false;
	curInteraction.resetAll()
});

document.getElementById("popupColorPicker_fader").addEventListener("mousemove", (e) => {
	if(curInteraction.colorSelBlock) onBlockColorChange(e);
	if(curInteraction.colorSelBar) onBaseColorChange(e);
	if(curInteraction.alphaSelBar) onAlphaChange(e);
});







const __onInpSetClrVal = (e, propName) => {
	if(e.ctrlKey && (e.key == "c" || e.key == "x")) return;
	if(!propName) throw new TypeError("propName always must be truthly!");
	if(!["R", "G", "B", "A"].includes(propName)) throw new TypeError("propName must be on of 'R', 'G', 'B', 'A'! Got: " + propName);


	if(isNaN(parseInt(e.target.value))) return;
	e.target.value = parseInt(e.target.value) > 255 ? 255 : parseInt(e.target.value) < 0 ? 0 : parseInt(e.target.value);
	
	selectedColor[propName] = parseInt(e.target.value);
	onManualColorInput();
}
_ri.addEventListener("keyup", (e) => {__onInpSetClrVal(e, "R")});
_gi.addEventListener("keyup", (e) => {__onInpSetClrVal(e, "G")});
_bi.addEventListener("keyup", (e) => {__onInpSetClrVal(e, "B")});
_ai.addEventListener("keyup", (e) => {__onInpSetClrVal(e, "A")});


_hi.addEventListener("keydown", (e) => {
	if(
		(!["0", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e" ,"f",   "x", "v", "backspace", "clear", "delete", "eraseeof"].includes(e.key.toLocaleLowerCase())) ||
		(e.target.value == "#" && ["Backspace", "Clear", "Delete", "EraseEof"].includes(e.key)) ||
		(e.target.value.length >= 9 && !["Backspace", "Clear", "Delete", "EraseEof",].includes(e.key) && !(e.ctrlKey && ["c", "v", "a", "x"].includes(e.key.toLocaleLowerCase())))
	) e.preventDefault();
});
_hi.addEventListener("keyup", (e) => {
	if(e.ctrlKey && (e.key == "c" || e.key == "x")) return;

	if(!e.target.value.startsWith("#")) e.target.value = "#" + e.target.value;
	if(e.target.value.length !== 7 && e.target.value.length !== 9) return;								//#RRGGBB(AA)
	if(isNaN(parseInt(e.target.value.substring(1), 16))) return;


	
	selectedColor.setMultiple(...HEXToRGBA(e.target.value.length == 7 ? e.target.value + "ff" : e.target.value));
	onManualColorInput(true);
});




for(const btn of document.getElementsByClassName("colorPickerButton")){
	btn.addEventListener("click", (e) => {
		if(e.target.getAttribute("data-disabled") == "true") return;
		activeSelectorBTNID = e.target.id;

		let c = CSS_RGBAToHEX(e.target.style?.backgroundColor);
		c = c || e.target.getAttribute("data-defval");

		openColorPickerPopup(c.length == 7 ? c + "ff" : c);
	});
}
