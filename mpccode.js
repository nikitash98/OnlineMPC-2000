var canvas;
var canvasctx;
var audio;
var audioctx;
var songLength;
var theBuffer;
var source;
var playpoint;
var timeStart = 0;
var theData;
var isPlaying = false;
var player;
var scrubbing = false;
var scrubTime;
var selectMode = false;
var selections = [0, 0];
var selectedPad = 0;
var buttons = [
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0],
	[0, 0]
];

$(document).ready(function(){
	canvas = document.getElementById("thecanvas");
	canvasctx = canvas.getContext('2d');
	audioctx = new AudioContext();

	var mouseDown = false;
	loadMusic('song.mp3');
	$(".pad").mousedown(function(){
		selectedPad = this.value;
		playPad();


	});
	$(".pad").mouseup(function(){
		player.stop();
		isPlaying = false;
		console.log("firing");
	});
	//MOUSEDOWN
	$('#thecanvas').on("mousedown", function(e){
		console.log("Click at: " + e.clientX);
		var mousePosX = e.clientX - canvas.getBoundingClientRect().left;
		var mousePosY = e.clientY - canvas.getBoundingClientRect().top;
		if(selectMode){
			buttons[selectedPad][0] = mousePosX;
			buttons[selectedPad][1] = mousePosX;
		}

		player.stop();
		isPlaying = false;
		mouseDown = true;
	});
	//MOUSEUP
	$('#thecanvas').on("mouseup", function(e){
		var mousePosX = e.clientX - canvas.getBoundingClientRect().left;
		var mousePosY = e.clientY - canvas.getBoundingClientRect().top;
		timeStart = songLength*mousePosX/canvas.width;
		if(selectMode){
			buttons[selectedPad][1] = mousePosX;
		}
		playSong(theBuffer, timeStart);
		isPlaying = true;
		mouseDown = false;
		scrubbing = false;
	});
	//MOUSEMOVE
	$('#thecanvas').on("mousemove", function(e){
		var mousePosX = e.clientX - canvas.getBoundingClientRect().left;
		var mousePosY = e.clientY - canvas.getBoundingClientRect().top;
		if(mouseDown){
			scrubTime = mousePosX;
			scrubbing = true;
		}
		if(selectMode && mouseDown){
			buttons[selectedPad][1] = mousePosX;
		}
	});
	window.addEventListener("keydown", doKeyDown, true);
	window.addEventListener("keyup", doKeyUp, true);
});

//HANDLERS -------------------------------------------------------------------

function doKeyUp(e){
	delete keys[e.which];
	if(e.keyCode == 16){
		selectMode = false;
	}
	if(e.keyCode == 32){
		e.preventDefault();
	}
	/*switch(e.keyCode){
				case 49:
				case 50:
				case 51:
				case 52:
				case 53:
				case 81:
				case 87:
				case 69:
				case 82:
				case 65:
				case 83:
				case 68:
				case 70:
				case 90:
				case 88:
				case 67:
				case 86:
				pressed = false;
				isPlaying = false;
				player.stop();
				timeStart += audioctx.currentTime - playpoint;
				break;

	if(e.keyCode == 49 || e.keyCode == 50)
		{
			pressed = false;
				isPlaying = false;
				player.stop();
				timeStart += audioctx.currentTime - playpoint;
		}
	}*/
}



var keys = [];
function doKeyDown(e) {
	keys[e.which] = true;

	if(e.keyCode == 16) {
		selectMode = true;
	}
	if(e.keyCode == 32){
		e.preventDefault();
		if(isPlaying){
			isPlaying = false;
			player.stop();
			timeStart += audioctx.currentTime - playpoint;

		} else {
			playSong(theBuffer, timeStart);
			isPlaying = true;

		}
	}
}

var keyPlaying = false;
var num = [2, 3, 5];
var pressed = []
//UPDATER-----------------------------------------------------------
function updater() {
	canvasctx.clearRect(0,0, canvas.width, canvas.height);
	drawBars(theData);
		drawSelection();


	
	if(isPlaying){
		playbackBar((timeStart + audioctx.currentTime-playpoint)*canvas.width/songLength);
	} else 
	if(scrubbing){
		playbackBar(scrubTime);
	} else {
		playbackBar(timeStart*canvas.width/songLength);
	}
	if(selectMode){
		
	}

	window.requestAnimationFrame(updater);
}

//DRAWING FUNCTIONS ----------------------------------------------------------
function drawSelection(){
	canvasctx.fillStyle = 'rgba(255, 165, 0, .3)';
	canvasctx.fillRect(buttons[selectedPad][0], canvas.height/2-50, buttons[selectedPad][1]-buttons[selectedPad][0], 100);
}


function playbackBar(position){
	canvasctx.fillStyle = "#FF0000"
	canvasctx.fillRect(position, canvas.height/2-50, 1, 100);	
}



function drawBars(buffer) {
	for(var i = 0; i < buffer.length; i+=500){
		if((i/48000)%30 == 0 ){
			canvasctx.fillStyle = "black";
			canvasctx.fillRect(i * canvas.width/buffer.length, canvas.height/2-50, 1, 100);		
		} else {
			canvasctx.fillStyle = "white";
		}
		canvasctx.fillRect(i * canvas.width/buffer.length, canvas.height/2, .5, buffer[i]*50);
	}
}

//MUSIC RELATED --------------------------------------------
function playPad(){
		timeStart = buttons[selectedPad][0]*songLength/canvas.width;
		player.stop();
		isPlaying = true;
		playSong(theBuffer, timeStart);
		$(".pad").removeClass("selected");
		$("[value =" + selectedPad + "]").addClass("selected");
	console.log("IS PLAYING" + isPlaying);

}
function playSong(theSong, start){
	playpoint = audioctx.currentTime;
	player = audioctx.createBufferSource();
	player.buffer = theSong;
	player.connect(audioctx.destination);
	player.start(0, start);
}
function loadMusic(url){
	source = audioctx.createBufferSource();

	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.responseType = "arraybuffer";
	req.onreadystatechange = function (e) {
		if(req.readyState == 4) {
			if(req.status == 200)
				{
					audioctx.decodeAudioData(req.response, function(buffer){
						source.buffer = buffer;
						theBuffer = buffer;
						source.connect(audioctx.destination);
						songLength = source.buffer.duration;
						theData = source.buffer.getChannelData(0);
						updater();
						$("#start").click(function(){
							if(!isPlaying){
								playSong(source.buffer, timeStart);
								isPlaying = true;
							}
						});
						$("#stop").click(function(){
							if(isPlaying) {
								player.stop();
								timeStart += audioctx.currentTime - playpoint;
								isPlaying = false;
							}
						});
						
						
						
						
						
						
						
					});
				} else {
					alert("LOAD WRONG URL");
				}
		}
	};
	req.send();
}
