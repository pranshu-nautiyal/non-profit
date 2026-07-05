(function () {
	var mapEl = document.getElementById('chapter-map');
	if (!mapEl || typeof L === 'undefined') return;

	// Chapter directory (only one chapter open so far). Add more entries here
	// as new chapters launch — the search will automatically rank by distance.
	var chapters = [
		{
			name: 'Chicago Chapter',
			address: 'Address details coming soon',
			lat: 41.8781,
			lng: -87.6298
		}
	];

	var map = L.map(mapEl, { scrollWheelZoom: false }).setView([41.8781, -87.6298], 5);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		maxZoom: 18
	}).addTo(map);

	var chapterMarkers = chapters.map(function (c) {
		return L.marker([c.lat, c.lng]).addTo(map).bindPopup('<strong>' + c.name + '</strong><br>' + c.address);
	});

	var userMarker = null;

	function haversineMiles(lat1, lon1, lat2, lon2) {
		function toRad(x) {
			return (x * Math.PI) / 180;
		}
		var R = 3958.8;
		var dLat = toRad(lat2 - lat1);
		var dLon = toRad(lon2 - lon1);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	var form = document.getElementById('chapter-search-form');
	var cityInput = document.getElementById('search-city');
	var stateInput = document.getElementById('search-state');
	var zipInput = document.getElementById('search-zip');
	var resultsEl = document.getElementById('chapter-results');
	var searchBtn = document.getElementById('chapter-search-btn');
	var locationBtn = document.getElementById('use-location-btn');

	function setSearchLoading(isLoading) {
		searchBtn.disabled = isLoading;
		searchBtn.textContent = isLoading ? 'Searching…' : 'Search';
	}

	function showMessage(message) {
		resultsEl.innerHTML = '<p class="chapter-results-message">' + message + '</p>';
	}

	function renderResults(areaLabel, lat, lng) {
		if (userMarker) map.removeLayer(userMarker);
		userMarker = L.circleMarker([lat, lng], {
			radius: 8,
			color: '#e0a800',
			weight: 2,
			fillColor: '#ffc526',
			fillOpacity: 1
		})
			.addTo(map)
			.bindPopup(areaLabel || 'Your location');

		map.setView([lat, lng], 6);
		userMarker.openPopup();

		var ranked = chapters
			.map(function (c) {
				return {
					chapter: c,
					distance: haversineMiles(lat, lng, c.lat, c.lng)
				};
			})
			.sort(function (a, b) {
				return a.distance - b.distance;
			})
			.slice(0, 3);

		var html = '';
		if (areaLabel) {
			html += '<p class="chapter-results-area">Showing chapters closest to ' + areaLabel + '</p>';
		}
		html += ranked
			.map(function (r) {
				return (
					'<div class="chapter-result-row">' +
					'<div class="chapter-result-info">' +
					'<h4>' +
					r.chapter.name +
					'</h4>' +
					'<p>' +
					r.chapter.address +
					'</p>' +
					'</div>' +
					'<div class="chapter-result-distance">' +
					'<strong>' +
					Math.round(r.distance) +
					'</strong>' +
					'<span>miles</span>' +
					'</div>' +
					'</div>'
				);
			})
			.join('');

		resultsEl.innerHTML = html;
	}

	function geocode(query) {
		return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&' + query).then(function (res) {
			return res.json();
		});
	}

	function handleSearch(e) {
		e.preventDefault();

		var city = cityInput.value.trim();
		var state = stateInput.value.trim();
		var zip = zipInput.value.trim();

		if (!city && !state && !zip) {
			showMessage('Enter a city, state, or zip code to search.');
			return;
		}

		var params = [];
		if (city) params.push('city=' + encodeURIComponent(city));
		if (state) params.push('state=' + encodeURIComponent(state));
		if (zip) params.push('postalcode=' + encodeURIComponent(zip));
		params.push('country=USA');

		setSearchLoading(true);

		geocode(params.join('&'))
			.then(function (data) {
				setSearchLoading(false);

				if (!data || !data.length) {
					showMessage('We couldn&rsquo;t find that location. Double check the city, state, or zip code and try again.');
					return;
				}

				var lat = parseFloat(data[0].lat);
				var lng = parseFloat(data[0].lon);
				var label = [city, state, zip].filter(Boolean).join(', ') || data[0].display_name;

				renderResults(label, lat, lng);
			})
			.catch(function () {
				setSearchLoading(false);
				showMessage('Something went wrong. Please try again.');
			});
	}

	function handleUseLocation() {
		if (!('geolocation' in navigator)) {
			showMessage('Location access isn&rsquo;t available in this browser.');
			return;
		}

		locationBtn.disabled = true;
		locationBtn.textContent = 'Locating…';
		showMessage('Finding your location…');

		navigator.geolocation.getCurrentPosition(
			function (position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;

				fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
					.then(function (res) {
						return res.json();
					})
					.then(function (data) {
						var label = data && data.display_name ? data.display_name : 'your location';
						renderResults(label, lat, lng);
					})
					.catch(function () {
						renderResults('your location', lat, lng);
					})
					.finally(function () {
						locationBtn.disabled = false;
						locationBtn.innerHTML = '<i data-lucide="locate-fixed"></i>Use My Location';
						if (window.lucide) window.lucide.createIcons();
					});
			},
			function () {
				locationBtn.disabled = false;
				locationBtn.innerHTML = '<i data-lucide="locate-fixed"></i>Use My Location';
				if (window.lucide) window.lucide.createIcons();
				showMessage('We couldn&rsquo;t access your location. Please allow location access, or search by city, state, or zip code instead.');
			}
		);
	}

	if (form) form.addEventListener('submit', handleSearch);
	if (locationBtn) locationBtn.addEventListener('click', handleUseLocation);
})();
