// Read URL parameters
function getURLParams(param) {
	var vars = {};
	window.location.href.replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function(m, key, value) { // callback
			vars[key] = value !== undefined ? decodeURIComponent(value) : '';
		}
	);

	if (param) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
}
var urlParams = getURLParams();

// Initial digit position for each number graphic
// 9-0
var initialPosCountdown = [-5562, -4944, -4326, -3708, -3090, -2472, -1854, -1236, -618, 0];
// 5-0 (first minute and second digit)
var initialMidPosCountdown = [-3090, -2472, -1854, -1236, -618, 0];
// 2-0 (first hour digit)
var initialSmallPosCountdown = [-1236, -618, 0];
var classNamesCountdown = ['jours', 'heures', 'minutes', 'secondes'];
var idNamesCountdown = ['d', 'h', 'm', 's'];
var animationFramesCountdown = 5;
var frameShiftCountdown = 103;

// Scaling
var scale = urlParams['scale'];
if (!$.isNumeric(scale)) scale = 0.7; // Default value
$('#countdown-blog').css({
	'-webkit-transform': 'scale(' + scale + ')',
	'-moz-transform': 'scale(' + scale + ')',
	'-ms-transform': 'scale(' + scale + ')',
	'-o-transform': 'scale(' + scale + ')',
	'transform': 'scale(' + scale + ')'
});

// Starting numbers
var nowCountdown = new Date().getTime();
var endCountdown = nowCountdown;

// Target date
var targetDate = Date.parse(urlParams['date']);
if (targetDate && targetDate > nowCountdown) {
	endCountdown = targetDate;
}

// Initial diff
var theDiffCountdown = endCountdown - nowCountdown;

// Function that controls counting
function doCountCountdown() {
	var x = getTimeStringCountdown(theDiffCountdown);

	theDiffCountdown = endCountdown - new Date().getTime();
	if (theDiffCountdown <= 0) {
		theDiffCountdown = 0;
	}

	var y = getTimeStringCountdown(theDiffCountdown);
	if (x != y) {
		//console.log(x + ' -> ' + y);
		digitCheckCountdown(x, y);
	}
}

// This checks the old value vs. new value, to determine how many digits need to be animated.
function digitCheckCountdown(x, y) {
	var a = x.split(':');
	var b = y.split(':');
	for (var i = 0, c = a.length; i < c; i++) {
		if (a[i].length < 2) a[i] = '0' + a[i];
		if (b[i].length < 2) b[i] = '0' + b[i];
		var countA = a[i].toString().length;
		var countB = b[i].toString().length;
		if (countB < countA) removeDigitCountdown(i, countB);
		for (var j = 0; j < countB; j++) {
			if (b[i].charAt(j) != a[i].charAt(j)) {
				var which = idNamesCountdown[i] + j;
				animateDigitCountdown(which, a[i].charAt(j), b[i].charAt(j));
			}
		}
	}
}

// Function to break the time into day:hour:minute:second
function getTimeStringCountdown(d) {
	var diff = d;
	var days = Math.floor(diff / 86400000);
	diff -= days * 86400000;
	var hours = Math.floor(diff / 3600000);
	diff -= hours * 3600000;
	var minutes = Math.floor(diff / 60000);
	diff -= minutes * 60000;
	var seconds = Math.floor(diff / 1000);
	return days + ':' + hours + ':' + minutes + ':' + seconds;
}

// Looks in correct array to get the digit's position
function getPosCountdown(id, digit) {
	if (id == 's0' || id == 'm0') {
		return initialMidPosCountdown[digit];
	} else if (id == 'h0') {
		return initialSmallPosCountdown[digit];
	} else {
		return initialPosCountdown[digit];
	}
}

// Animation function
function animateDigitCountdown(which, oldDigit, newDigit) {
	var speed = 80;
	var pos = getPosCountdown(which, oldDigit);
	var newPos = getPosCountdown(which, newDigit);
	// Stop the currently-running animation
	$("#" + which).finish();
	// Each animation is 5 frames long, and 103px down the background image.
	// We delay each frame according to the speed above.
	for (var k = 0; k < animationFramesCountdown; k++) {
		pos -= frameShiftCountdown;
		if (k == (animationFramesCountdown - 1)) {
			$("#" + which).delay(speed).animate({
				'background-position': '0 ' + pos + 'px'
			}, 0, function() {
				// At end of animation, shift position to new digit.
				$("#" + which).css({
					'background-position': '0 ' + newPos + 'px'
				}, 0);
			});
		} else {
			$("#" + which).delay(speed).animate({
				'background-position': '0 ' + pos + 'px'
			}, 0);
		}
	}
}

// Remove digit
function removeDigitCountdown(i, count) {
	$("li#" + idNamesCountdown[i] + count).remove();
}

// Sets the correct digits on load
function initialDigitCheckCountdown(initialDiff) {
	var initialDiffAsString = getTimeStringCountdown(initialDiff);
	var visible = initialDiff <= 0;

	// Creates the html
	var a = initialDiffAsString.split(':');
	for (var i = 0, c = a.length; i < c; i++) {
		if (a[i].length < 2) a[i] = '0' + a[i];
		if (!visible && a[i].toString() !== '00') visible = true;
		if (visible) {
			var count = a[i].toString().length;
			var html = '<div class="set"><ul class="' + classNamesCountdown[i] + '">';
			var bit = count;
			for (var j = 0; j < count; j++) {
				bit--;
				html += '<li id="' + idNamesCountdown[i] + j + '"></li>';
				if (bit != 0 && bit != (count) && bit % 3 == 0) html += '<li class="comma"></li>';
			}
			html += '</ul><h2>' + classNamesCountdown[i].toUpperCase() + '</h2>';
			// If you don't like the ':' separator, remove the following line
			if (i != 3) html += '</div><div class="separator">:</div>';

			$("#countdown-blog").append(html);
		}
	}
	// Sets digits to the right number
	for (var n = 0, cn = a.length; n < cn; n++) {
		for (var m = 0; m < a[n].toString().length; m++) {
			var thisID = idNamesCountdown[n] + m;
			var thisPos = getPosCountdown(thisID, a[n].charAt(m));
			$("#" + idNamesCountdown[n] + m).css({
				'background-position': '0 ' + thisPos + 'px'
			});
		}
	}
}

// Self-correcting alternative to JavaScript's setInterval
function setCorrectingInterval(func, delay) {
	if (!(this instanceof setCorrectingInterval)) {
		return new setCorrectingInterval(func, delay);
	}

	var target = (new Date().valueOf()) + delay;
	var that = this;

	function tick() {
		if (that.stopped) return;

		target += delay;
		func();

		setTimeout(tick, target - (new Date().valueOf()));
	};

	setTimeout(tick, delay);
};

function clearCorrectingInterval(interval) {
	interval.stopped = true;
}

// Start it up
initialDigitCheckCountdown(theDiffCountdown);
if (theDiffCountdown > 0) {
	setCorrectingInterval(doCountCountdown, 1000);
}
