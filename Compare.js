let UIController = (function() {
  return {
    setProfilePicture(profileLink1, profileLink2) {
      document.querySelector(".player-1 img").src = profileLink1;
      document.querySelector(".player-2 img").src = profileLink2;
    },
    setNames(name1, name2) {
      document.querySelectorAll(".player-1")[0].innerHTML = name1;
      document.querySelectorAll(".player-2")[0].innerHTML = name2;
    },
    setCountry(countryName) {
      document.querySelectorAll(".player-1")[2].innerHTML = countryName;
    },
    setMostPlayedGame(gameName1) {
      document.querySelectorAll(".player-1")[3].innerHTML = gameName1;
    },
    setNoOfFriends(count1, count2) {
      document.querySelectorAll(".player-1")[4].innerHTML = count1;
      document.querySelectorAll(".player-2")[4].innerHTML = count2;
    },
    setTotalGamePrice(price) {
      document.querySelectorAll(".player-1")[5].innerHTML = price;
    },

    setTimeCreated(time1, time2) {
      document.querySelectorAll(".player-1")[6].innerHTML = new Date(
        time1 * 1000
      ).toDateString();
      document.querySelectorAll(".player-2")[6].innerHTML = new Date(
        time2 * 1000
      ).toDateString();
    },

    setTotalGames(gameCount) {
      document.querySelectorAll(".player-1")[7].innerHTML = gameCount;
    }
  };
})();

let steamController = (function() {
  let corsString = "http://localhost:8080";
  let gameObjPlayTime = JSON.parse(localStorage.getItem("gameObj"));
  let steamObj = new Array(2);
  steamObj[0] = JSON.parse(localStorage.getItem("steamObj"));
  steamObj[1] = "";
  console.log(steamObj[0]);
  let compareID = localStorage.getItem("compareID");

  let gameObjPrice;

  let gameIds = new Array(2);
  gameIds[0] = new Array(5);

  let gameTotalPrice = [0, 0];
  let countryName = [];

  async function getCountryName() {
    let tempRes = await fetch(
      `https://restcountries.eu/rest/v2/alpha/in?fields=name`
    );
    tempRes = await tempRes.json();
    countryName[0] = tempRes.name;
    UIController.setCountry(countryName[0]); //Change this
  }
  getCountryName();

  async function getSecondPlayer() {
    let result = await fetch(
      `${corsString}/api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamObj[0].steamKey}&steamids=${compareID}`
    );
    let tempRes = await result.json();
    steamObj[1] = tempRes.response.players[0];

    result = await fetch(
      `${corsString}/api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${steamObj[0].steamKey}&steamid=${compareID}&relationship=friend`
    );
    steamObj[1].playerObj = await result.json();
  }

  getSecondPlayer().then(() => {
    console.log(steamObj[1]);
    UIController.setProfilePicture(
      steamObj[0].playerObj.avatarfull,
      steamObj[1].avatarfull
    );

    UIController.setNames(
      steamObj[0].playerObj.personaname,
      steamObj[1].personaname
    );

    UIController.setNoOfFriends(
      steamObj[0].friendsId.length,
      steamObj[1].playerObj.friendslist.friends.length
    );

    UIController.setTimeCreated(
      steamObj[0].playerObj.timecreated,
      steamObj[1].timecreated
    );
  });

  async function getGamesByPlayTime() {
    let retVal = await fetch(
      `${corsString}/api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamObj[0].steamKey}&steamid=${steamObj[0].steamID}&include_appinfo=1&format=json`
    );
    gameObjPrice = await retVal.json();
  }

  getGamesByPlayTime()
    .then(() => {
      for (let i = 0; i < 10; i++) {
        gameIds[0][i] = gameObjPrice.response.games[i].appid;
      }
    })
    .then(() => {
      fetch(
        `${corsString}/store.steampowered.com/api/appdetails/?appids=${gameIds[0].join(
          ","
        )}&filters=price_overview`
      )
        .then(result => {
          return result.json();
        })
        .then(finalRes => {
          for (key in finalRes) {
            if (finalRes[key].data.length === 0) {
              continue;
            }
            gameTotalPrice[0] += finalRes[key].data.price_overview.final;
          }

          gameTotalPrice[0] = "₹" + gameTotalPrice[0] / 100;
          UIController.setTotalGamePrice(gameTotalPrice[0]); //Change this
        });
    });

  return {
    compareStats1: {
      // name: steamObj[0].playerObj.personaname,
      noOfFriends: steamObj[0].friendsId.length,
      profilePic: steamObj[0].playerObj.avatarfull,
      mostPlayedGame: gameObjPlayTime.gameList.games[0].name,
      timeCreated: steamObj[0].playerObj.timecreated,
      totalGames: gameObjPlayTime.gameList.game_count
    }
    // compareStats2: {
    //   profilePic: steamObj[1].playerObj.avatarfull
    // }
  };
})();

let controller = (function(steamCtrl, UICtrl) {
  return {
    init() {
      //  UICtrl.setProfilePicture(
      //     steamCtrl.compareStats1.profilePic,);

      //UICtrl.setNames(steamCtrl.compareStats1.name);
      UICtrl.setMostPlayedGame(steamCtrl.compareStats1.mostPlayedGame);
      UICtrl.setNoOfFriends(steamCtrl.compareStats1.noOfFriends);
      UICtrl.setTimeCreated(steamCtrl.compareStats1.timeCreated);
      UICtrl.setTotalGames(steamCtrl.compareStats1.totalGames);
    }
  };
})(steamController, UIController);

controller.init();

