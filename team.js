(function () {
	var container = document.getElementById('team-testimonial');
	if (!container) return;

	var team = [
		{
			name: 'Mithil Shah',
			title: 'CEO &amp; Co-Founder',
			desc: 'Mithil co-founded the organization after watching a single piece of art bring his grandmother comfort during her battle with Alzheimer&rsquo;s. He leads the team&rsquo;s vision, partnerships, and overall strategy.',
			image: 'Mithil.png'
		},
		{
			name: 'Akhil Narayanan',
			title: 'CFO &amp; Co-Founder',
			desc: 'Akhil oversees the organization&rsquo;s finances, from budgeting art kit distributions to managing grants and donations, so every dollar goes toward reaching more patients.',
			image: 'akhil.png'
		},
		{
			name: 'Pranshu Nautiyal',
			title: 'CTO &amp; Co-Founder',
			desc: 'Pranshu builds and maintains the technology behind the organization&rsquo;s work, from the website to the tools volunteers use to coordinate visits and track impact.',
			image: 'pranshu.png'
		},
		{
			name: 'Aveek Sarkar',
			title: 'CGO &amp; Co-Founder',
			desc: 'Aveek leads growth and outreach, building relationships with care facilities, schools, and young artists to bring the organization&rsquo;s programs to more communities.',
			image: 'aveek.png'
		}
	];

	var nameEl = document.getElementById('tt-name');
	var titleEl = document.getElementById('tt-title');
	var descEl = document.getElementById('tt-desc');
	var cardEl = container.querySelector('.tt-card');
	var photoEl = container.querySelector('.tt-photo');
	var dotsEl = document.getElementById('tt-dots');
	var prevBtn = document.getElementById('team-prev');
	var nextBtn = document.getElementById('team-next');

	var currentIndex = 0;

	team.forEach(function (_, i) {
		var dot = document.createElement('button');
		dot.type = 'button';
		dot.className = 'tt-dot';
		dot.setAttribute('aria-label', 'Go to team member ' + (i + 1));
		dot.addEventListener('click', function () {
			goTo(i);
		});
		dotsEl.appendChild(dot);
	});

	var dots = Array.prototype.slice.call(dotsEl.querySelectorAll('.tt-dot'));

	function updatePhoto(member) {
		if (member.image) {
			photoEl.classList.add('has-image');
			photoEl.innerHTML = '<img src="' + member.image + '" alt="' + member.name + '">';
		} else {
			photoEl.classList.remove('has-image');
			photoEl.innerHTML = '<i data-lucide="image"></i><span>Image placeholder</span>';
			if (window.lucide) window.lucide.createIcons();
		}
	}

	function render() {
		var member = team[currentIndex];

		[cardEl, photoEl].forEach(function (el) {
			el.classList.remove('is-visible');
		});

		window.setTimeout(function () {
			nameEl.textContent = member.name;
			titleEl.innerHTML = member.title;
			descEl.innerHTML = member.desc;
			updatePhoto(member);
			[cardEl, photoEl].forEach(function (el) {
				el.classList.add('is-visible');
			});
		}, 180);

		dots.forEach(function (dot, i) {
			dot.classList.toggle('is-active', i === currentIndex);
		});
	}

	function goTo(index) {
		currentIndex = (index + team.length) % team.length;
		render();
	}

	if (prevBtn) prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
	if (nextBtn) nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });

	updatePhoto(team[0]);
	[cardEl, photoEl].forEach(function (el) {
		el.classList.add('is-visible');
	});
	dots[0].classList.add('is-active');
})();
