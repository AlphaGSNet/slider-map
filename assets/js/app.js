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

function changeData(year) {
	currentYear = year;

	initRangeSlider();
}