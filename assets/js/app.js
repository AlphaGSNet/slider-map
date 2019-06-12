if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;
var data;

var camera, cameraTarget, scene, renderer;

var mouse = new THREE.Vector2(), INTERSECTED;

var heigth1 = [];
var heigth2 = [];
var heigth3 = [];
var heigth4 = [];
var heigth5 = [];
var heigth6 = [];
var heigth7 = [];
var heigth8 = [];

var layer = [];
var sortedLayers = [];
var heightsGlobal = [];
var heightsGlobal2 = [];

var graph = [];
var graphSystem;

var years = [];

var dataByYear = [];
var filteredData = [];

var stateId = 'NY';
var stateName = 'New York';
var currentYear = 2014;

var frustumSize = 1000;

//<-- variables and constants for range slider
const V32 = 6713924.71096368, V33 = 9220164.67645724, V34 = 6696779.94470847, V35 = 0, W32 = 147694.905991326, W33 = 62164.7495848525, W34 = 63714.9196865604, W35 = 0, X35 = 23244349.8830916, Y35 = 3402810.70215527, Z35 = 1927823.98763521, VIS_VAL_MAX = 4.25;
var rA1, rA2, rA3, rA4, rA5, rA6, ciA1, ciA2, ciA3, ciA4, ciA5, ciA6, tA1, tA2, tA3, tA4, tA5, tA6;
var rangeSlider = 0,
    dataCubeChart = [],
    dataRange = [
			10, // CL
			20,  // PA
			30,  // NG
			50, // A6
			60,  // A3
			70,  // A1
			80,  // A5
			90,  // A2
			95  // A4
    ],
    dataRangeArray = [
			10, // CL
			20,  // PA
			30,  // NG
			50, // A6
			60,  // A3
			70,  // A1
			80,  // A5
			90,  // A2
			95  // A4
    ],
    dataRangeLabelCode = [
			"CL",
			"PA",
			"NG",
			"A6",
			"A3",
			"A1",
			"A5",
			"A2",
			"A4"
    ],
    handleInited = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
    ],
    dataRangeLabel = [
			"Coal",
			"Petroleum",
			"Natural Gas",
			"Nuclear",
			"Geothermal",
			"Solar",
			"Biomass",
			"Wind",
			"Hydro"
    ],
    sliderHandleStyleClass = [
			"coal",
			"petroleum",
			"natural-gas",
			"nuclear",
			"geothermal",
			"solar",
			"biomass",
			"wind",
			"hydro",
			"hydro"
    ],
    dataRangeColor = [
			"#404040",
			"#808080",
			"#bfbfbf",
			"#D9444E",
			"#F77C48",
			"#FFDB87",
			"#9DD7A5",
			"#3C8FBB",
			"#4E6EB1",
			"#4E6EB1"
    ],
    dataParamByIndex = {
			"rA1": 0,
			"rA2": 0,
			"rA3": 0,
			"rA4": 0,
			"rA5": 0,
			"rA6": 0,
			"ciA1": 0,
			"ciA2": 0,
			"ciA3": 0,
			"ciA4": 0,
			"ciA5": 0,
			"ciA6": 0,
			"tA1": 0,
			"tA2": 0,
			"tA3": 0,
			"tA4": 0,
			"tA5": 0,
			"tA6": 0,
			"cl": 0,
			"ng": 0,
			"pa": 0,
    };
//<-- variables and constants for range slider

// data for cube
$.getJSON('https://dl.dropboxusercontent.com/s/2wlj6asyoai8dk0/cube_test.json', function (info) {
	var count = Object.keys(info).length;
	for (var i = 1; i <= count; i++) {
		dataCubeChart.push(info[i]);
	}
});

$.getJSON('https://dl.dropboxusercontent.com/s/3aqbpvn6kar1a87/data.json', function (info) {
	data = info;

	var count = Object.keys(data).length;

	for (var i = 1; i < count; i++) {
		years.push(data[i].Year);
	}

	// get unique years
	years = years.filter( uniqueVal );
	years.sort(function (a, b) {return a - b});

	//sort data by years
	for (var i = 0; i < years.length; i++) {
		dataByYear[years[i]] = [];

		for (var j = 1; j < count; j++) {
			if (data[j].Year !== years[i]) { continue }
			dataByYear[years[i]].push(data[j]);
		}
	}

	var input = document.getElementById("1");
	input.setAttribute("min", years[0]);
	input.setAttribute("max", years[years.length-1]);
	input.setAttribute("value", years[years.length-1]);

	document.getElementById("slider1-value").innerHTML = years[years.length - 1];
	
	init();
	animate();
	changeData(currentYear);

	// init slider connect color
	$('#range-slider .noUi-connect').each(function (index) {
		$(this).css('background', dataRangeColor[index]);
	});
	// add the hexagon class to slider handle
	$('#range-slider .noUi-tooltip').each(function (index) {
		$(this).addClass('hexagon').addClass(sliderHandleStyleClass[index]);
	});
});

// RETURN UNIQUE VALUE

function uniqueVal(value, index, self) { 
  return self.indexOf(value) === index;
}
// CLEAR ARRAY 
Array.prototype.clean = function (deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

var getParamIndex = function (paramName) {
  return dataParamByIndex[paramName];
};

function getHandleValue(values, handle, isInt) {
	var result = parseFloat(values[handle]);

	if (handle > 0) {
		result = parseFloat(values[handle]) - parseFloat(values[handle - 1]);
	}

	if (isInt) {
		return parseInt(Math.round(result));
	} else {
		return result;
	}
}

/**
 * Create multi range slider
 */
function createMultiRangeSlider(inputRange) {
	var data4Slider = [], maxRange = 0, inputRangeLen = inputRange.length;
	// Generate data for slider
	for (var i = 0; i < inputRangeLen; i++) {
		maxRange += inputRange[i];
		data4Slider.push(maxRange);
	}
	if (rangeSlider != 0) {
		// slider already created
		rangeSlider.noUiSlider.updateOptions({
			start: data4Slider
		});
	} else {
		// create multi range slider
		rangeSlider = document.getElementById('range-slider');
		noUiSlider.create(rangeSlider, {
			start: data4Slider,
			connect: [true, true, true, true, true, true, true, true, true, true],
			tooltips: [true, true, true, true, true, true, true, true, true],
			range: {
				'min': 0,
				'max': maxRange
			}
		}).on('update', function (values, handle) {
			var handles = values.length;
			for (var i = 0; i < handles; i++) {
				$('.noUi-handle[data-handle="' + i + '"] .noUi-tooltip').text('').html('<p class="noUi-tooltip-text">' + dataRangeLabel[i] + '</p>');
				$('.noUi-handle[data-handle="' + i + '"]').attr('data-before', getHandleValue(values, i, true));
			}
			updateRangeSlider(values, handle);
		});
	}
}

/**
 * Initialize range slider
 */
function initRangeSlider() {
	// init values
	var filteredDataLen = dataCubeChart.length, clSum = ngSum = paSum = checkSum = 0;
	for (var i = 0; i < filteredDataLen; i++) {
		var filteredDataItem = dataCubeChart[i], filterDataItemType = filteredDataItem.Type;

		if (filterDataItemType == "B") {
			clPercent = parseFloat(filteredDataItem['11']) / V32 * 100;
			ngPercent = (parseFloat(filteredDataItem['21']) - W32) / V32 * 100;
			paPercent = parseFloat(filteredDataItem['31']) / V32 * 100;
			
			var c13 = parseFloat(filteredDataItem['11']),
			d13 = clPercent * (W33 + W34) / 100,
			e13 = clPercent * V35 / 100,
			clSum = c13 + d13 + e13,
			f13 = ngPercent * V32 / 100,
			g13 = ngPercent * (V33 + V34) / 100,
			h13 = ngPercent * V35 / 100,
			ngSum = f13 + g13 + h13,
			i13 = paPercent * V32 / 100,
			j13 = paPercent * (V33 + V34) / 100;
			k13 = paPercent * V35,
			paSum = i13 + j13 + k13,
			checkSum = clSum + ngSum + paSum;

			// values for calculating
			dataParamByIndex['cl'] = clSum / checkSum;
			dataParamByIndex['ng'] = ngSum / checkSum;
			dataParamByIndex['pa'] = paSum / checkSum;

			// values for range slider
			dataRangeArray[dataRangeLabelCode.indexOf("CL")] = clPercent;
			dataRangeArray[dataRangeLabelCode.indexOf("NG")] = ngPercent;
			dataRangeArray[dataRangeLabelCode.indexOf("PA")] = paPercent;
		} else if (filterDataItemType != "C") {
			var rVal = parseFloat(filteredDataItem['11']) + parseFloat(filteredDataItem['21']) + parseFloat(filteredDataItem['31']),
					ciVal = parseFloat(filteredDataItem['12']) + parseFloat(filteredDataItem['22']) + parseFloat(filteredDataItem['32']),
					tVal = parseFloat(filteredDataItem['13']) + parseFloat(filteredDataItem['23']) + parseFloat(filteredDataItem['33']);
			dataParamByIndex["r" + filterDataItemType] = rVal;
			dataParamByIndex["ci" + filterDataItemType] = ciVal;
			dataParamByIndex["t" + filterDataItemType] = tVal;

			// value for range slider
			dataRangeArray[dataRangeLabelCode.indexOf(filterDataItemType)] = getParamIndex("r" + filterDataItemType) / V32 * 100;
		}
	}

	// create range slider
	createMultiRangeSlider(dataRangeArray);
}

/**
 * Update range slider event
 * @param {*} values data
 * @param {*} handle index
 */
function updateRangeSlider(values, handle) {
	// check if it is slider initialization
	if (!handleInited[handle]) {
		handleInited[handle] = true;
	}
	for (var i = 0; i < handleInited.length; i++) {
		if (!handleInited[i]) {
			return;
		}
	}
	// update the data
	var rangeLabel = dataRangeLabelCode[handle],
	clParam = dataRangeArray[dataRangeLabelCode.indexOf("CL")],
	ngParam = dataRangeArray[dataRangeLabelCode.indexOf("NG")],
	paParam = dataRangeArray[dataRangeLabelCode.indexOf("PA")];

	if (rangeLabel == "CL") {
		clParam = getHandleValue(values, handle, false);
	} else if (rangeLabel == "PA") {
		paParam = getHandleValue(values, handle, false);
	} else if (rangeLabel == "NG") {
		ngParam = getHandleValue(values, handle, false);
	} else {
		dataParamByIndex['r' + rangeLabel] = getHandleValue(values, handle, false) * V32 / 100;
		dataParamByIndex['ci' + rangeLabel] = getHandleValue(values, handle, false) * (V33 + V34) / 100;
		dataParamByIndex['t' + rangeLabel] = getHandleValue(values, handle, false) * V35 / 100;
	}

	// generate data from slider changes
	var updatedData = [], updatedDataLen = dataCubeChart.length;
	for (var i = 0; i < updatedDataLen; i++) {
		var updatedDataItem = {}, updatedDataItemType = dataCubeChart[i].Type;

		if (updatedDataItemType == "B") {
			updatedDataItem['11'] = String(clParam * V32 / 100);
			updatedDataItem['12'] = String((clParam * (V33 + V34)) / 100);
			updatedDataItem['13'] = String((clParam * V35) / 100);
			updatedDataItem['21'] = String(((ngParam * V32) / 100) + W32);
			updatedDataItem['22'] = String(((W33 + W34) + ((ngParam * (V33 + V34) / 100))));
			updatedDataItem['23'] = String(((ngParam * V35 / 100) + W35));
			updatedDataItem['31'] = String(paParam * V32 / 100);
			updatedDataItem['32'] = String(paParam * (V33 + V34) / 100);
			updatedDataItem['33'] = String(((paParam * V35 / 100) + (X35 + Y35 + Z35)));
		} else if (updatedDataItemType != "C") {
			for (var j = 1; j <= 3; j++) {
				updatedDataItem[j + '1'] = String(getParamIndex('r' + updatedDataItemType) * getParamIndex('cl'));
				updatedDataItem[j + '2'] = String(getParamIndex('ci' + updatedDataItemType) * getParamIndex('cl'));
				updatedDataItem[j + '3'] = String(getParamIndex('t' + updatedDataItemType) * getParamIndex('cl'));
			}
		} else {
			for (var j = 1; j <= 3; j++) {
				for (var k = 1; k <= 3; k++) {
					updatedDataItem[String(j) + String(k)] = dataCubeChart[i][String(j) + String(k)];
				}
			}
		}

		updatedDataItem['State'] = dataCubeChart[i].State;
		updatedDataItem['Type'] = dataCubeChart[i].Type;
		updatedDataItem['Year'] = dataCubeChart[i].Year;
		updatedData.push(updatedDataItem);
	}

	// update graph
	for (var i = 0; i < 8; i++) {
		layer[i] = [];
	}

	for (var i = 0; i < updatedDataLen; i++) {
		fillGraph(updatedData[i].Type, updatedData[i], i);
	}
	updateGraphVisually();
}

/**
 * jQuery plugin to add comma to numbers every three digits
 */
$.fn.digits = function () {
	return this.each(function () {
		$(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
	})
}

/**
 * Show the total energy sum of cubes are visible currently
 */
function showTotalEnergySum() {
	var sum = 0;
	for (var i = graph.length - 1; i >= 0; i--) {
		if (graph[i].visible == true && graph[i].name.indexOf("-") >= 0) {
			sum += graph[i].value;
		}
	}
	$(".total_energy_sum").text(sum).digits();
}

/**
 * Switch filter item
 */
function switchFilterItem() {
	var checkBox = document.getElementById("switch-filter-item");

	$('.filter-item').each(function (index) {
		if (checkBox.checked == true) {
			$(this).removeClass('off').addClass('on');
		} else {
			$(this).removeClass('on').addClass('off');
		}
	});

	for (var i = graph.length - 1; i >= 0; i--) {
		graph[i].visible = checkBox.checked;
	}

	showTotalEnergySum();
}

function init() {
	container = document.getElementById( 'canvas' );

	var aspect = window.innerWidth / window.innerHeight;
	// camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 10000 );
	var d = 60;
	camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 1, 1000);
	// camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
							
	camera.position.set( 60,60,60 );

	cameraTarget = new THREE.Vector3( 0, 0, 0 );

	scene = new THREE.Scene();
	///scene.background = new THREE.Color( 0x72645b );
	scene.fog = new THREE.Fog( 0xffffff, 100, 150 );

	// Ground if needed

	var plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 40, 40 ),
		new THREE.MeshPhongMaterial( { color: 0x9FD6E1, specular: 0x101010 } )
	);
	plane.rotation.x = -Math.PI/2;

	var spread = 10.5;
	graphSystem = new THREE.Group();
	graphSystem.position.z = -100;
	graphSystem.rotation.y = Math.PI;
	scene.add(graphSystem);

	// Lights shortcodes to add light

	scene.add( new THREE.HemisphereLight( 0xffffff, 0xcccccc, 0.4 ) );

	addShadowedLight( 1, 0, 1, 0xffffff, 0.6 );
	addShadowedLight( -1, 0, 1, 0xffffff, 0.6 );

	// renderer scene settings. Don't touch it

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.renderReverseSided = false;

	// CONTROLS
	cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
	cameraControls.addEventListener( 'change', render );

	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'mousemove', onDocumentMouseMove, false );
}

// Function that creates light with its given parameters
function addShadowedLight( x, y, z, color, intensity ) {
	var directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z );
	scene.add( directionalLight );

	directionalLight.castShadow = true;

	var d = 1;
	directionalLight.shadow.camera.left = -d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = -d;

	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 4;

	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;

	directionalLight.shadow.bias = -0.005;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	camera.lookAt (cameraTarget);

	render();
}

function render() {
	TWEEN.update();

	renderer.render( scene, camera );
}

// SLIDERS
var sliders = document.getElementsByClassName('slider');

for (var i = 0; i < sliders.length; i++) {
	sliders[i].addEventListener('input', onSliderInput, false);
	sliders[i].addEventListener('change', onSliderChange, false);
}

function onSliderInput() {
	var output = 'slider' + this.id + '-value';
	document.getElementById(output).innerHTML = this.value;
	changeData(this.value);
}

function onSliderChange() {
  changeData(this.value);
}

function onDocumentMouseMove(event) {
	if (!INTERSECTED) {
		var popupX = event.clientX;
		var popupY = event.clientY - 140;
	}

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(graph);

	if ( intersects.length > 0 ) {
		if ( INTERSECTED != intersects[0].object ) {
			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			for (var i = 0; i < graph.length; i++) {
				graph[i].material.opacity = 0.6;
			}

			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex(0xff0000);
			INTERSECTED.material.opacity = 0.8;

			$('html,body').css('cursor', 'pointer');
		}

		var towerName = INTERSECTED.name;
		towerName = towerName.substring(towerName.indexOf("-") + 1); // get tower index (11...33)

		if (INTERSECTED.singleTower) {
			var totalSum =  parseInt(scene.getObjectByName('B00').value) +
											parseInt(scene.getObjectByName('B01').value) +
											parseInt(scene.getObjectByName('B02').value) +
											parseInt(scene.getObjectByName('C').value) +
											parseInt(scene.getObjectByName('A1').value) +
											parseInt(scene.getObjectByName('A2').value) +
											parseInt(scene.getObjectByName('A3').value) +
											parseInt(scene.getObjectByName('A4').value) +
											parseInt(scene.getObjectByName('A5').value) +
											parseInt(scene.getObjectByName('A6').value);

			// var sectorType = ' All type of </b> sector(s)';
			var sectorType = '';
		} else {
			var totalSum =  parseInt(scene.getObjectByName('B-' + towerName + '').value) +
											parseInt(scene.getObjectByName('C-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A1-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A2-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A3-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A4-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A5-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A6-' + towerName + '').value);

			var sectorType = ' in ' + INTERSECTED.sector + '</b> sector(s)';
		}

		if (INTERSECTED.energyType == 'waste') {
			var verb = 'wasted';
			var energyType = '';
		} else {
			var verb = 'used';
			var energyType = INTERSECTED.energyType;
		}
	} else {
		if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		$('html,body').css('cursor', 'default');

		for (var i = 0; i < graph.length; i++) {
			graph[i].material.opacity = 0.8;
		}

		if ($( '#popup' ).hasClass( 'close' )) {
			$('#popup').fadeOut(400);            
		} else {
			$('#popup').fadeIn(100);       
		}
	}
}

function changeData(year) {
	currentYear = year;

	filteredData = [];

	for (var i = 0; i < dataByYear[year].length; i++) {
		if ( dataByYear[year][i].State == stateId ) {
			filteredData.push( dataByYear[year][i] );
		}
	}

	for (var i = 0; i < 8; i++) {
		layer[i] = [];
	}

	for (var i = 0; i < filteredData.length; i++) {
		fillGraph( filteredData[i].Type, filteredData[i], i );
	}

	updateGraphVisually();
	// updateChart();
	initRangeSlider();
}

function fillGraph(name, dataSet, layerNumber) {
	layer[layerNumber].name = name; //assigning layer name

	var correctionValue = 2; // any dummy positive value otherwise logarithmic scale returns -Infinity

	for (var i = 0; i < 8; i++) {
		heightsGlobal2[i] = [];
	}

	if (name == 'B') {
		var object00 = scene.getObjectByName( 'B00' );
		var rawValue2 = parseInt(dataSet['11']) + parseInt(dataSet['12']) + parseInt(dataSet['13']);
		object00.value = Math.round(rawValue2);
		object00.state = dataSet.State;
		object00.year = dataSet.Year;
		var visValue2;

		if ( rawValue2 < 1 ) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2) }

		object00.visValue = visValue2;
		object00.scale.y = visValue2;

		var object01 = scene.getObjectByName( 'B01' );
		var rawValue2 = parseInt(dataSet['21']) + parseInt(dataSet['22']) + parseInt(dataSet['23']);
		object01.value = Math.round(rawValue2);
		object01.state = dataSet.State;
		object01.year = dataSet.Year;
		var visValue2;

		if ( rawValue2 < 1 ) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2)}

		object01.visValue = visValue2;
		object01.scale.y = visValue2;

		var object02 = scene.getObjectByName( 'B02' );
		var rawValue2 = parseInt(dataSet['31']) + parseInt(dataSet['32']) + parseInt(dataSet['33']);
		object02.value = Math.round(rawValue2);
		object02.state = dataSet.State;
		object02.year = dataSet.Year;
		var visValue2;

		if ( rawValue2 < 1 ) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2) }

		object02.visValue = visValue2;
		object02.scale.y = visValue2;
	} else {
		var object2 = scene.getObjectByName( name );
		var rawValue2 = parseInt(dataSet['11']) + parseInt(dataSet['12']) + parseInt(dataSet['13']) + parseInt(dataSet['21']) + parseInt(dataSet['22']) + parseInt(dataSet['23']) + parseInt(dataSet['31']) + parseInt(dataSet['32']) + parseInt(dataSet['33']);
		object2.value = Math.round(rawValue2);
		object2.state = dataSet.State;
		object2.year = dataSet.Year;
		var visValue2;
		
		if ( rawValue2 < 1 ) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2) }

		object2.visValue = visValue2;
		object2.scale.y = visValue2;
	}

	// heightsGlobal2[layerNumber] = visValue2; // not needed for now

	var visValueMax = 0; // maxium of visValue

	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var firstLetter = i+1;
			var secondLetter = j+1;
			var object = scene.getObjectByName( ''+name+'-'+firstLetter+''+secondLetter+'' );

			if (firstLetter == 1) {
				object.sector = 'Home';
			}

			if (firstLetter == 2) {
				object.sector = 'Business';
			}

			if (firstLetter == 3) {
				object.sector = 'Transport';
			}

			// if (secondLetter == 1) {
			//     object.energyType = 'Coal';
			// }

			// if (secondLetter == 2) {
			//     object.energyType = 'Petroleum';
			// }

			// if (secondLetter == 3) {
			//     object.energyType = 'Natural Gas';
			// }		

			var rawValue = dataSet['' + firstLetter + '' + secondLetter + ''];
			object.value = Math.round(rawValue);
			object.state = dataSet.State;
			object.year = dataSet.Year;

			var visValue;

			if ( rawValue < 1 ) { visValue = Math.log(correctionValue) } else { visValue = Math.log(rawValue) }

			layer[layerNumber].push(object);
			object.visValue = visValue;
			object.scale.y = visValue;

			if (visValueMax < visValue) {
				visValueMax = visValue;
			}				
		}
	}

	if (visValueMax > VIS_VAL_MAX) {
		// if visible value is too large, adjust it
		var divider4Adjust = visValueMax / VIS_VAL_MAX;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var firstLetter = i + 1;
				var secondLetter = j + 1;
				var object = scene.getObjectByName('' + name + '-' + firstLetter + '' + secondLetter + '');
				var newVisValue = object.visValue / divider4Adjust;
				object.visValue = newVisValue;
				object.scale.y = newVisValue;
			}
		}
	}

	showTotalEnergySum();    
}

function updateGraphVisually() {
	for (var i = 0; i < 3; i++) {
		heightsGlobal[i] = [];

		for (var j = 0; j < 3; j++) {
			heightsGlobal[i][j] = 0;
		}
	}

	for (var i = 0; i < layer.length; i++) {
		if (layer[i].name == 'B') { sortedLayers[0] = layer[i] }
		if (layer[i].name == 'C') { sortedLayers[1] = layer[i] }

		if (layer[i].name == 'A4') { sortedLayers[2] = layer[i] }
		if (layer[i].name == 'A2') { sortedLayers[3] = layer[i] }
		if (layer[i].name == 'A5') { sortedLayers[4] = layer[i] }
		if (layer[i].name == 'A1') { sortedLayers[5] = layer[i] }
		if (layer[i].name == 'A3') { sortedLayers[6] = layer[i] }
		if (layer[i].name == 'A6') { sortedLayers[7] = layer[i] }
	}

	for (var k = 0; k < sortedLayers.length; k++) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var firstLetter = i + 1;
				var secondLetter = j + 1;

				var object = scene.getObjectByName('' + sortedLayers[k].name + '-' + firstLetter + '' + secondLetter + '');

				if ( sortedLayers[k].name == 'B' ) {
					object.position.y = object.visValue / 2;
					heightsGlobal[i][j] += object.visValue;
				} else {
					object.position.y = object.visValue / 2 + heightsGlobal[i][j];
					heightsGlobal[i][j] += object.visValue;
				}
			}
		}
	}

	var object00 = scene.getObjectByName( 'B00' );
	object00.position.y = object00.visValue / 2;

	var object01 = scene.getObjectByName( 'B01' );
	object01.position.y = object01.visValue / 2 + object00.visValue;

	var object02 = scene.getObjectByName( 'B02' );
	object02.position.y = object02.visValue / 2 + object00.visValue + object01.visValue;

	var object2 = scene.getObjectByName( 'C' );
	object2.position.y = object2.visValue / 2 + object00.visValue + object01.visValue + object02.visValue;

	var object3 = scene.getObjectByName( 'A4' );
	object3.position.y = object3.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue;

	var object4 = scene.getObjectByName( 'A2' );
	object4.position.y = object4.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue;

	var object5 = scene.getObjectByName( 'A5' );
	object5.position.y = object5.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue;

	var object6 = scene.getObjectByName( 'A1' );
	object6.position.y = object6.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue;

	var object7 = scene.getObjectByName( 'A3' );
	object7.position.y = object7.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue + object6.visValue;

	var object8 = scene.getObjectByName( 'A6' );
	object8.position.y = object8.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue + object6.visValue + object7.visValue;
}

function onDocumentClickPopUp(id) {
	var raycaster = new THREE.Raycaster();

	function raycast(camera, items, type) {
		var listener = function (event) {
			var vector = new THREE.Vector3();

			var mouse = {
				x:  ((event.clientX - (window.innerWidth - 800) / 2 -1) / 760 ) * 2 - 1,
				y: -((event.clientY - 170 - 1) / 460) * 2 + 1
			};

			vector.set(mouse.x, mouse.y , 0.5);
			vector.unproject(camera);

			raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());

			var target = raycaster.intersectObjects(items);

			if (target.length) {
				target[0].type = type;
				target[0].object.dispatchEvent(target[0]);
			}
		};

		document.addEventListener(type, listener, false);
	}	

	var boxes = [];
	var cells = [];
	var mouse = new THREE.Vector2();
	var treeMapElementToDraw = document.getElementById("grayMapBody");
	var canvas = d3.select(treeMapElementToDraw).append("canvas")
			.style("opacity", 0)
			.style('background-color', '#EAEAEA');

	canvas.node().getContext("webgl").globalCompositeOperation = 'destination-over';
	var renderer = new THREE.WebGLRenderer({ canvas: canvas.node(), antialias: true });
	renderer.setSize(760, 460);
	treeMapElementToDraw.appendChild(renderer.domElement);

	var camera = new THREE.PerspectiveCamera(30, 760 / 460, 1, 7000);
	camera.position.z = 2000;
	camera.position.y = -8500;

	var scene = new THREE.Scene();

	var light = new THREE.HemisphereLight('#ffffff', '#666666', 1.5);
	light.position.set(0, 3000, 0);
	scene.add(light);

	window.addEventListener('resize', onWindowResize, false);

	function onWindowResize() {
		camera.aspect = 760 / 460;
		camera.updateProjectionMatrix();
		renderer.setSize(760, 460);
	}

	id = 1;

	d3.json('data/' + id + '.json', function (err, data) {
			var _width = 1000;
			var _height = 1000;
			var _depth = 1000;

			var treemap = d3.layout.treemap()
					.size([_width, _height])
					.value(function (d) {
						return d["size"];
					});

			var sumx = [];
			var sumy = [];
			var maxe = 0;

			for (var i = 0; i < data.xn; i++) {
				for (var j = 0; j < data.yn; j++) {
					maxe = Math.max(maxe, data.e[i][j])
				}
			}
			for (var i = 0; i < data.xn; i++) {
				if (i == 0) sumx[i] = 0;
				else sumx[i] = sumx[i - 1] + data.xi[i - 1];
			}
			sumx[data.xn] = sumx[data.xn - 1] + data.xi[data.xn - 1];
			for (var i = 0; i < data.yn; i++) {
				if (i == 0) sumy[i] = 0;
				else sumy[i] = sumy[i - 1] + data.yi[i - 1];
			}
			sumy[data.yn] = sumy[data.yn - 1] + data.yi[data.yn - 1];
			for (var i = 0; i < data.xn; i++) {
				for (var j = 0; j < data.yn; j++) {
					boxes.push({
						w: data.xi[i] * _width / sumx[data.xn],
						h: data.yi[j] * _height / sumy[data.yn],
						depth: data.e[i][j] * _depth / maxe,
						x: sumx[i] * _width / sumx[data.xn],
						y: sumy[j] * _height / sumy[data.yn],
						id: i + j * data.xn + 1,
					});
				}
			}
			var size = [_width, _height] // Width, Height
			var cscale = d3.scale.category10();

			var color1 = new THREE.MeshPhongMaterial({ color: '#ff0000' });
			var backing = new THREE.BoxGeometry(size[0], size[1], 100);

			var root = SubUnit.select(scene);
			var container = root.append("object");

			var xAxis = 0, yAxis = 0;
			$(document).on('mousemove', function (event) {
				xAxis = event.clientX;     // Get the horizontal coordinate
				yAxis = event.clientY;
			})
			var someValue = 1;
			function timeFrame() {					
				var prevVal = $("#checkchange").val() !== undefined ? $("#checkchange").val() : null;
				if (prevVal == someValue) {
					$('#popup').fadeOut(300);
				} else {
					someValue = prevVal;
				}
			}
			var _myInterval = setInterval(function () {
				timeFrame();
			}, 1000)

			var cells = container.selectAll("cell")
													.data(boxes).enter()
													.append("mesh")
													.attr("tags", "bar")
													.attr("material", function (d) {
															// d.baseMaterial = new THREE.MeshPhongMaterial({color: cscale(d.id), shininess: 100});
															d.baseMaterial = new THREE.MeshPhongMaterial({ color: '#BBBBBB' });
															return d.baseMaterial;
													})
													.attr("geometry", function (d) {
															// var w = Math.max(0, d.dx-1);
															// var h = Math.max(0, d.dy-1);
															return new THREE.BoxGeometry(d.w, d.h, d.depth);
													})
													.each(function (d, i) {
															var x0 = d.x + (d.w / 2) - _width / 2;
															var y0 = d.y + (d.h / 2) - _height / 2;
															var z0 = d.depth / 2;
															this.position.set(x0, y0, z0);
													})
													.on('click', function (event, d) {
															d3.select("#msg").html("id: " + d.id);
															// d3.select('#popup').html("id: " + d.id);
															if (this.material === color1) {
																	this.material = d.baseMaterial;
															} else {
																	this.material = color1;
															}
													})
													.on('mousemove', function (event, d) {
															mouse.x = (xAxis / 760) * 2 - 1;
															mouse.y = -(yAxis / 460) * 2 + 1;
															var popupY = yAxis;
															$('#popup').html('<b>ID: </b>' + d.id); //show some data in popup window on intersection
															$('#popup').fadeIn(300);
															$('#popup').css('left', '' + xAxis + 'px');
															$('#popup').css('top', '' + popupY + 'px');
															$("#checkchange").val(d.id);
													});

			camera.position.z = 2500;

			raycast(camera, d3.merge(cells), 'click');
			raycast(camera, d3.merge(cells), 'mousemove');

			var cntrl = new THREE.TrackballControls(camera, renderer.domElement);
			cntrl.rotateSpeed = 2.0;
			cntrl.minDistance = 100;
			cntrl.maxDistance = 6000;

			function animate() {
				cntrl.update();
				TWEEN.update();
				requestAnimationFrame(animate);
				renderer.render(scene, camera);
			}

			animate();
	});
}