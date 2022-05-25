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

	resetAll: () => {curInteraction.colorSelBlock = false; curInteraction.colorSelBar = false; curInteraction.alphaSelBar = false;}
};
const curSelPos = {
	x: mainCanv.width - 10,
	y: 15,
	colorStripY: 0,
	alphaStripY: 0
}
let baseColor = "#FF0000";
let currentColorSel = "";
let currentColorSelWithAlpha = "";










onBlockColorSelection();   //calling this method instead of draw, to do initial color selelction
drawColorSelectStrip();
drawColorAlphaSelectStrip();











function drawColorSelectorBox(){
	mainCtx.clearRect(0, 0, mainCanv.width, mainCanv.height);


	mainCtx.fillStyle = baseColor;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = mainBoxLightGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = mainBoxDarkGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	// --------------- thumb ------------ //
	const clr = currentColorSel.substring(1);

	mainCtx.beginPath();
	mainCtx.strokeStyle = (0.2126 * parseInt(clr[0] + clr[1], 16) + 0.7152 * parseInt(clr[2] + clr[3], 16) + 0.0722 * parseInt(clr[4] + clr[5], 16)) > 128 ? "#000000AA" : "#FFFFFFAA";
	mainCtx.arc(curSelPos.x, curSelPos.y, 3, 0, Math.PI * 2);
	mainCtx.stroke();
}



function drawColorSelectStrip(){
	clrSelCtx.beginPath();
	clrSelCtx.rect(0, 0, clrSelCanv.width, clrSelCanv.height);
	clrSelCtx.fillStyle = colorStripColorGradient;
	clrSelCtx.fill();

	clrSelCtx.beginPath();
	clrSelCtx.strokeStyle = "#000000AA";
	clrSelCtx.rect(1, curSelPos.colorStripY - 2, clrSelCanv.width - 1, 4);
	clrSelCtx.stroke();
}



function drawColorAlphaSelectStrip(){
	const transpGradient = alpSelCtx.createLinearGradient(0, 0, 0, alpSelCanv.height);
	transpGradient.addColorStop(0, currentColorSel + "FF");
	transpGradient.addColorStop(1, currentColorSel + "00");

	alpSelCtx.beginPath();
	alpSelCtx.clearRect(0, 0, alpSelCanv.width, alpSelCanv.height);
	alpSelCtx.rect(0, 0, alpSelCanv.width, alpSelCanv.height);
	alpSelCtx.fillStyle = transpGradient;
	alpSelCtx.fill();

	alpSelCtx.beginPath();
	alpSelCtx.strokeStyle = "#000000AA";
	alpSelCtx.rect(1, curSelPos.alphaStripY - 2, alpSelCanv.width - 1, 4);
	alpSelCtx.stroke();
}





function onBaseColorChange(e){
	if(!e.clientY) return;

	const boundingBox = clrSelCanv.getBoundingClientRect();
	curSelPos.colorStripY = (e.clientY - boundingBox.top) > clrSelCanv.height ? clrSelCanv.height - 1 : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top);

	drawColorSelectStrip();

	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we check the Y position + some rounding to give a solid color stop on the base values.
	switch(Math.round(((clrSelCanv.height == curSelPos.colorStripY + 1 ? clrSelCanv.height : curSelPos.colorStripY) / clrSelCanv.height) * 100)){
		case 0: case 1:				baseColor = RGBAToHex(255, 0, 0);	break;
		case 16: case 17: case 18:	baseColor = RGBAToHex(255, 255, 0);	break;
		case 33: case 34: case 35:	baseColor = RGBAToHex(0, 255, 0);	break;
		case 50: case 51: case 52:	baseColor = RGBAToHex(0, 255, 255);	break;
		case 67: case 68: case 69:	baseColor = RGBAToHex(0, 0, 255);	break;
		case 84: case 85: case 86:	baseColor = RGBAToHex(255, 0, 255);	break;
		case 99: case 100:			baseColor = RGBAToHex(255, 0, 0);	break;
		default:
			const clrData = clrSelCtx.getImageData((clrSelCanv.width / 2), curSelPos.colorStripY, 1, 1).data;
			baseColor = RGBAToHex(clrData[0], clrData[1], clrData[2]);
			break;
	}
	

	drawColorSelectorBox();
	onBlockColorSelection();
	onAlphaChange({clientY: curSelPos.alphaStripY});
}


function onBlockColorSelection(){
	drawColorSelectorBox();


	const clrData = mainCtx.getImageData(curSelPos.x, curSelPos.y, 1, 1).data;

	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we round up primary color values like R, G, B, C, Y, P, W etc.
	const _R = 3;
	clrData[0] = (clrData[0] + _R >= 255) ? 255 : (clrData[0] - _R <= 0) ? 0 : clrData[0];
	clrData[1] = (clrData[1] + _R >= 255) ? 255 : (clrData[1] - _R <= 0) ? 0 : clrData[1];
	clrData[2] = (clrData[2] + _R >= 255) ? 255 : (clrData[2] - _R <= 0) ? 0 : clrData[2];
	
	if(curSelPos.x == 1) clrData[0] = clrData[1] = clrData[2] = Math.max(clrData[0], clrData[1], clrData[2]) //make left-most side have equal values.



	currentColorSel = RGBAToHex(clrData[0], clrData[1], clrData[2]);
	
	
	_ri.value = clrData[0];
	_gi.value = clrData[1];
	_bi.value = clrData[2];

	onAlphaChange({clientY: curSelPos.alphaStripY});
}
function onBlockColorChange(e){
	if(!e.clientY && e.clientX) return;

	const boundingBox = mainCanv.getBoundingClientRect();
	const offsetX = Math.round((e.clientX - boundingBox.left) > mainCanv.width ? mainCanv.width - 1 : (e.clientX - boundingBox.left) < 0 ? 1 : (e.clientX - boundingBox.left));
	const offsetY = Math.round((e.clientY - boundingBox.top) > mainCanv.height ? mainCanv.height : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top));

	curSelPos.x = offsetX;
	curSelPos.y = offsetY;

	onBlockColorSelection(offsetX, offsetY);
}




function onAlphaChange(e){
	if(e.clientY === undefined) return;

	const boundingBox = alpSelCanv.getBoundingClientRect();
	curSelPos.alphaStripY = (e.clientY - boundingBox.top) > alpSelCanv.height ? alpSelCanv.height - 1 : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top);


	drawColorAlphaSelectStrip();

	const clrData = alpSelCtx.getImageData((alpSelCanv.width / 2), curSelPos.alphaStripY, 1, 1).data;
	//terrible temp stuff. The canvas API does not gurantee that a canvas's gradient would hold one of the color stop values. So temporarily we round up primary color values like R, G, B, C, Y, P, W etc.
	const _R = 3;
	clrData[3] = (clrData[3] + _R >= 255) ? 255 : (clrData[3] - _R <= 0) ? 0 : clrData[3];
	
	currentColorSelWithAlpha = currentColorSel + clrData[3].toString(16).padStart(2, "0");

	_ai.value = clrData[3];
	_hi.value = currentColorSelWithAlpha;
	document.getElementById("popupColorPickerResultPreview").style.setProperty("--clr_picker_bgcolor", currentColorSelWithAlpha)
}




function findColorValueInBar(r,g,b, precision = 25){
	const round = (x, p) => {return x < p ? 0 : (Math.ceil(x / p) * p)}
	const iData = clrSelCtx.getImageData(Math.floor(clrSelCanv.width / 2), 0, 1, Math.round(clrSelCanv.height));

	mainCtx.putImageData(iData, mainCanv.width / 2, 0)
	for(let i = 0; i < iData.data.length; i += 4){
		if(
			round(parseInt(r), precision) == round(iData.data[i], precision) &&
			round(parseInt(g), precision) == round(iData.data[i + 1], precision) &&
			round(parseInt(b), precision) == round(iData.data[i + 2], precision)
		) return i / 4;
	}
	return NaN;
}



function RGBAToHex(r,g,b,a){
	return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0") + (a !== undefined ? a.toString(16).padStart(2, "0") : "");
}
function hexToRGBA(hex){
	if(hex.length != 7 && hex.length != 9) return [0, 0, 0, 0];

	const x = hex.substring(1);
	if(x.length == 6) return [parseInt(x[0] + x[1], 16), parseInt(x[2] + x[3], 16), parseInt(x[4] + x[5], 16), 0];
	else if(x.length == 8) return [parseInt(x[0] + x[1], 16), parseInt(x[2] + x[3], 16), parseInt(x[4] + x[5], 16), parseInt(x[6] + x[7], 16)];
	return [0, 0, 0, 0];
}




document.getElementById("popupColorPicker_fader").addEventListener("mousedown", (e) => {
	switch(e.target.id){
		case "popupColorPickerCanvMain":
			curInteraction.colorSelBlock = true;
			onBlockColorChange(e);
			break;
		case "popupColorPickerCanvColor":
			curInteraction.colorSelBar = true;
			onBaseColorChange(e);
			break;
		case "popupColorPickerCanvAlpha":
			curInteraction.alphaSelBar = true;
			break;

		default: curInteraction.resetAll(); break;
	}
});
document.getElementById("popupColorPicker_fader").addEventListener("mouseup", curInteraction.resetAll);

document.getElementById("popupColorPicker_fader").addEventListener("mousemove", (e) => {
	if(curInteraction.colorSelBlock) onBlockColorChange(e);
	if(curInteraction.colorSelBar) onBaseColorChange(e);
	if(curInteraction.alphaSelBar) onAlphaChange(e);
});








_ri.addEventListener("keyup", (e) => {

});
_gi.addEventListener("keyup", (e) => {

});
_bi.addEventListener("keyup", (e) => {

});
_ai.addEventListener("keyup", (e) => {

});

_hi.addEventListener("keyup", (e) => {
	
});




/*_ri.addEventListener("keyup", (e) => {
	if(_bi.value > _gi.value) drawColorSelectStripThumb(findColorValueInBar(_ri.value, 0, _bi.value))
	else drawColorSelectStripThumb(findColorValueInBar(_ri.value, _gi.value, 0))
});
_gi.addEventListener("keyup", (e) => {
	if(_ri.value > _bi.value) drawColorSelectStripThumb(findColorValueInBar(_ri.value, _gi.value, 0))
	else drawColorSelectStripThumb(findColorValueInBar(0, _gi.value, _bi.value))
})
_bi.addEventListener("keyup", (e) => {
	if(_ri.value > _gi.value) drawColorSelectStripThumb(findColorValueInBar(_ri.value, 0, _bi.value))
	else drawColorSelectStripThumb(findColorValueInBar(0, _gi.value, _bi.value))
})*/
