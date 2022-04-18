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



let isClicked = false;
let currentColorSel = "#FF0000";





mainCanv.width = parseInt(getComputedStyle(mainCanv).width);
mainCanv.height = parseInt(getComputedStyle(mainCanv).height);

clrSelCanv.width = parseInt(getComputedStyle(clrSelCanv).width);
clrSelCanv.height = parseInt(getComputedStyle(clrSelCanv).height);

alpSelCanv.width = parseInt(getComputedStyle(alpSelCanv).width);
alpSelCanv.height = parseInt(getComputedStyle(alpSelCanv).height);





drawColorSelectorBox(currentColorSel);
drawColorSelectStrip();


alpSelCtx.fillStyle = "rgba(0, 0, 255, 1)";
alpSelCtx.fillRect(0, 0, alpSelCanv.width, alpSelCanv.height);





function drawColorSelectorBox(baseClr){
	const darkGradient = mainCtx.createLinearGradient(0, 0, 0, mainCanv.height);
	darkGradient.addColorStop(0, "#00000000");
	darkGradient.addColorStop(1, "#000000FF");

	const lightGradient = mainCtx.createLinearGradient(0, 0, mainCanv.width, 0);
	lightGradient.addColorStop(0, "#FFFFFFFF");
	lightGradient.addColorStop(1, "#FFFFFF00");



	mainCtx.clearRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = baseClr;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = lightGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);

	mainCtx.fillStyle = darkGradient;
	mainCtx.fillRect(0, 0, mainCanv.width, mainCanv.height);
}


function drawColorSelectStrip(){
	const colorGradient = clrSelCtx.createLinearGradient(0, 0, 0, clrSelCanv.height);
	colorGradient.addColorStop(0,    "#FF0000");
	colorGradient.addColorStop(0.17, "#FFFF00");
	colorGradient.addColorStop(0.34, "#00FF00");
	colorGradient.addColorStop(0.51, "#00FFFF");
	colorGradient.addColorStop(0.68, "#0000FF");
	colorGradient.addColorStop(0.85, "#FF00FF");
	colorGradient.addColorStop(1,    "#FF0000");


	clrSelCtx.rect(0, 0, clrSelCanv.width, clrSelCanv.height);
	clrSelCtx.fillStyle = colorGradient;
	clrSelCtx.fill();
}

function drawColorSelectStripThumb(y){
	clrSelCtx.clearRect(0, 0, clrSelCanv.width, clrSelCanv.height);
	drawColorSelectStrip();

	clrSelCtx.beginPath();
	clrSelCtx.strokeStyle = "#000000AA";
	clrSelCtx.rect(1, y - 2, clrSelCanv.width - 1, 4);
	clrSelCtx.stroke();
}





function onBaseColorChange(e){
	if(!e.offsetY) return;

	const boundingBox = clrSelCanv.getBoundingClientRect();
	const offsetY = (e.clientY - boundingBox.top) > clrSelCanv.height ? clrSelCanv.height - 1 : (e.clientY - boundingBox.top) < 0 ? 0 : (e.clientY - boundingBox.top);


	drawColorSelectStripThumb(offsetY);

	const clrData = clrSelCtx.getImageData((clrSelCanv.width / 2), offsetY, 1, 1).data;
	drawColorSelectorBox("#" + clrData[0].toString(16).padStart(2, "0") + clrData[1].toString(16).padStart(2, "0") + clrData[2].toString(16).padStart(2, "0"));
	
	
	document.getElementById("popupColorPickerValInpR").value = clrData[0];
	document.getElementById("popupColorPickerValInpG").value = clrData[1];
	document.getElementById("popupColorPickerValInpB").value = clrData[2];
	document.getElementById("popupColorPickerValInpA").value = offsetY;
	document.getElementById("popupColorPickerValInpHEX").value = ("#" + clrData[0].toString(16).padStart(2, "0") + clrData[1].toString(16).padStart(2, "0") + clrData[2].toString(16).padStart(2, "0") + "00");
}





document.getElementById("popupColorPicker_fader").addEventListener("mousedown", (e) => {isClicked = true; onBaseColorChange(e)});
document.getElementById("popupColorPicker_fader").addEventListener("mouseup", () => {isClicked = false});
document.getElementById("popupColorPicker_fader").addEventListener("mousemove", (e) => {
	if(isClicked) onBaseColorChange(e);
})
//clrSelCanv.addEventListener("click", onBaseColorChange);