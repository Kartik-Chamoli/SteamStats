let UIcontroller = (function() {
  return {
    displayOwnedGames: function(gameArr) {
      let elementString =
        "<figure><img src=%imageURL%><figcaption>%gameName%</figcaption></figure>";
      let newElementString;
      let elementIns = document.getElementById("game-gallery");
      let length;
      if (gameArr.length > 10) {
        //Change this to show more games
        length = 10;
      } else {
        length = gameArr.length;
      }
      for (let i = 0; i < length; i++) {
        newElementString = elementString.replace(
          "%imageURL%",
          `https://steamcdn-a.akamaihd.net/steam/apps/${gameArr[i].appid}/header.jpg`
        );
        elementIns.insertAdjacentHTML(
          "beforeend",
          newElementString.replace("%gameName%", `${gameArr[i].name}`)
        );
      }
    },

    displayPlayedTime: function(gameArr) {
      let maxPlayed = gameArr[0].playtime_forever + 100;
      let timeLabel = document.getElementsByClassName("prog-label");
      let progressBar = document.getElementsByClassName("progress-bar");
      for (let i = 0; i < 5; i++) {
        timeLabel[i].childNodes[1].textContent = gameArr[i].name;

        progressBar[i].textContent =
          gameArr[i].playtime_forever / 60 > 0
            ? Math.round(` ${gameArr[i].playtime_forever / 60} `) + " hours"
            : `${gameArr[i].playtime_hour} minutes`;

        progressBar[i].style.width = `${(gameArr[i].playtime_forever /
          maxPlayed) *
          100}%`;

        document.querySelectorAll(".prog-label img")[
          i
        ].src = `http://media.steampowered.com/steamcommunity/public/images/apps/${gameArr[i].appid}/${gameArr[i].img_logo_url}.jpg`;
      }
    },

    displayFriends: function(playerArr) {
      let elementString =
        "<figure id='%index%'><img id='friend-btn-%index%' src='%imageURL%' alt=%SteamID64% onclick='newProfilePage(this)'><button class='compBtn' type='button'>COMPARE</button><figcaption>%friendName%</figcaption></figure>";
      let newElementString;
      let elementIns = document.getElementById("friend-gallery");

      for (let i = 0; i < 10; i++) {
        newElementString = elementString.replace("%index%", `${i}`);
        newElementString = newElementString.replace(
          "%imageURL%",
          `${playerArr[i].avatarfull}`
        );
        newElementString = newElementString.replace(
          "%SteamID64%",
          `${playerArr[i].steamid}`
        );
        elementIns.insertAdjacentHTML(
          "beforeend",
          newElementString.replace(
            "%friendName%",
            `${playerArr[i].personaname}`
          )
        );
      }
    }
  };
})();

let steamController = (function(UIctrl) {
  let corsString = "https://api.allorigins.win/get?url=";

  let steamObj = {

  };

  let gameObj = {};

  function steamUserName() {
    steamObj.steamID = localStorage.getItem("gamerID");
  }

  function getFriendsInfo() {
    let tempArr = [];
    for (let i = 0; i < 10; i++) {
      tempArr[i] = steamObj.friendsId[i];
    }
    let tempString = tempArr.join(",");
    fetch(`${corsString}${encodeURIComponent(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamObj.steamKey}&steamids=${tempString}`)}`
    ).then(res=>res.json())
    .then(res=>{
      res=JSON.parse(res.contents);
      UIcontroller.displayFriends(res.response.players);
    })
    .catch(err=>{
      alert(err);
    })
  }

  function steamFriendIds() {
    fetch(
      `${corsString}${encodeURIComponent(`https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamObj.steamKey}&steamid=${steamObj.steamID}&relationship=friend`)}`,
    ).then(res=>res.json())
    .then(res=>{
      res=JSON.parse(res.contents);
      steamObj.friendsId = res.friendslist.friends.map(function(item, index) {
        return res.friendslist.friends[index].steamid;
      })
    }).then(_=>getFriendsInfo())
  }

  function getPlayerSummaries() {
    fetch(
      `${corsString}${encodeURIComponent(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamObj.steamKey}&steamids=${steamObj.steamID}`)}`
    ).then(res=>res.json())
    .then(res=>{
      res=JSON.parse(res.contents);
      steamObj.playerObj = res.response.players[0];
      document.getElementById("id-head").textContent =
        steamObj.playerObj.personaname;
      document.getElementById("Profile-pic").src =
        steamObj.playerObj.avatarfull;
    });
  }

  return {
    createPlayerObject() {
      steamUserName();
      getPlayerSummaries();
      steamFriendIds();
    },

    getOwnedGames() {
      fetch(
        `${corsString}${encodeURIComponent(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamObj.steamKey}&steamid=${steamObj.steamID}&include_played_free_games=1&include_appinfo=1&format=json`)}`
      ).then(res=>res.json())
      .then(res=>{
        res=JSON.parse(res.contents);
        gameObj.gameList = res.response;
        gameObj.gameList.games.sort(function(a, b) {
          return b.playtime_forever - a.playtime_forever;
        }); //Sort according to the playtime

        UIctrl.displayOwnedGames(gameObj.gameList.games);
        UIctrl.displayPlayedTime(gameObj.gameList.games);
      });
    },

    steamObj: steamObj,
    gameObj: gameObj
  };
})(UIcontroller);

let controller = (function(steamCtrl, UIctrl) {
  let compareBtn = document.getElementById("friend-gallery");
  let top5games = [];

  compareBtn.addEventListener("click", event => {
    if (event.target.className == "compBtn") {
      localStorage.setItem("gameObj", JSON.stringify(steamCtrl.gameObj));
      localStorage.setItem("steamObj", JSON.stringify(steamCtrl.steamObj));
      localStorage.setItem(
        "compareID",
        event.target.parentElement.childNodes[0].alt
      );
      window.open("Compare.html", "_self");
    }
  });
  return {
    init() {
      steamCtrl.createPlayerObject();

      steamCtrl.getOwnedGames();
    }
  };
})(steamController, UIcontroller);

controller.init();

let newProfilePage = function(element) {
  localStorage.setItem("gamerID", element.alt);
  window.location.href = "DataDisplay.html";
};
