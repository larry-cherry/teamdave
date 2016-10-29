$.jCanvas.defaults.fromCenter = false; // Sets default draw start point to be from upper left corner
var $comicCanvas = $('#comic-canvas'); // <canvas id="comic-canvas" height="590" width="767">
var $savedComicCanvas = $('#saved-comic-canvas'); //<canvas id="saved-comic-canvas" width="767" height="129">
var hasBackground = false;

// EVENT HANDLERS
$(document).on('dragstart', function(e) {
	var target = e.target;
	if (target.className != 'draggable') {return};
	e.dataTransfer = e.originalEvent.dataTransfer;
	e.dataTransfer.setData('text/plain', target.src);
	if (target.src.includes("backgrounds")) {return};
	var img = new Image();
	img.src = target.src;
	e.dataTransfer.setDragImage(img, img.width/2, img.height/2);
});

$comicCanvas.on('dragover', function(e) {
	e.preventDefault();
	e.dataTransfer = e.originalEvent.dataTransfer;
	e.dataTransfer.dropEffect = 'move';
});

$comicCanvas.on('drop', function(e) {
	e.preventDefault();
	e.dataTransfer = e.originalEvent.dataTransfer;
	var src = e.dataTransfer.getData('text');
	
	// Find image size
	var img = new Image();
	img.src = src;

	// Use image size to draw on canvas right where you drop it.
	var x = e.pageX - $comicCanvas.offset().left - img.width/2;
	var y = e.pageY - $comicCanvas.offset().top - img.height/2;
	addLayer(src, x, y);
});

$('#images').on('click', 'img', function() {
	if(hasBackground){
		var x = ($comicCanvas.getLayers().length - 1) * 100;
	}else{ 
		//TODO: Change this line to bound the x, y and keep the image on screen by default
		var x = $comicCanvas.getLayers().length * 100; 
	}
	addLayer(this.src, x, 0);
});

// Discuss the necessity of this event before removing.
// $comicCanvas.on('click', function(e) {
// 	deSelectLayers();
// });

$('#delete-button').on('click', function(e) {
	deleteSelectedLayer();
});

// HELPER FUNCTIONS

function addLayer(src, x, y) {
	var index, isBackground;
	console.log(src.includes('backgrounds'));
	if (src.includes('backgrounds')) {
		isBackground = true;
		// Backgrounds are centered in canvas...
		x = 0;
		y = 0;
		// And replace the previous background if already drawn
		if (hasBackground) {
			$comicCanvas.removeLayer(0);
			index = 0; 
		}
		hasBackground = true;
	} else {
		isBackground = false;
		index = 1 + $comicCanvas.getLayers().length;
	};

	$comicCanvas.addLayer({
		type: 'image',
		source: src,
		x: x, y: y,
		draggable: false,
		index: index,
		// sel: true,
		isBackground: isBackground,
		// When selected, change to .6 opaque
		click: function(layer){
			// Deselect when background image is clicked
			if(isBackground){
				deSelectLayers();
			// Otherwise, select clicked layer
			}else{
				selectLayer(layer);
			}
		}
	});

	// TODO: Refactor to prevent issues with unwanted selection -- see 'Issues' in Git Hub Repo.
	// Get layer we just added and select it
	var length = $comicCanvas.getLayers().length;
	var layer = $comicCanvas.getLayers()[length - 1];
	selectLayer(layer);

	$comicCanvas.drawLayers();
};

function selectLayer(layer) {
	// Backgrounds aren't selectable by default
	if (layer.isBackground) {return}; 
	layer.opacity = 0.6;
	$comicCanvas.setLayer(layer, { draggable: true })
	// Uses built in JCanvas functionality to track the selected images
	.addLayerToGroup(layer, 'selected');
}

function deSelectLayers() {
	//Creates and array of all layers on the canvas
	var layers = $comicCanvas.getLayers();
	//Sets all the layer group to opacity 1 and draggable false
	$comicCanvas.setLayerGroup('selected', {
		opacity: 1,
		draggable: false
	})
	//Remove all layers in the 'selected' group and redraw
	for (var i=0; i < layers.length; i++) {
		var layer = layers[i];
		$comicCanvas.removeLayerFromGroup(layer, 'selected');
	}
}

function deleteSelectedLayer() {
	//Removes all layers from canvas in the 'selected' group and redraws layers
	$comicCanvas.removeLayerGroup('selected')
	.drawLayers();
}