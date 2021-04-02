let corsString = 'https://api.allorigins.win/get?url=';

let gamerId = document.getElementById('game-id');


(function () {
	let GetBtn = document.getElementById('Submit');

	GetBtn.addEventListener('click', event => {
		event.preventDefault();

		fetch(`${corsString}${encodeURIComponent(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamKey}&vanityurl=${gamerId.value}`)}`)
			.then(response => {
				 return response.json()
			})
			.then(data => {
				data=JSON.parse(data.contents);
				localStorage.setItem('gamerID',data.response.steamid);
				window.location.href = "DataDisplay.html";
			});

	})

	gamerId.addEventListener('keypress', event => {
		if (event.keyCode == 13) {
			event.preventDefault();
			fetch(`${corsString}${encodeURIComponent(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamKey}&vanityurl=${gamerId.value}`)}`)
			.then(response => {
				 return response.json()
			})
			.then(data => {
				data=JSON.parse(data.contents);
				localStorage.setItem('gamerID',data.response.steamid);
				window.location.href = "DataDisplay.html";
			});
		}
	})
	
}())