const colours = {
	normal: "#A8A77A",
	fire: "#EE8130",
	water: "#6390F0",
	electric: "#F7D02C",
	grass: "#7AC74C",
	ice: "#96D9D6",
	fighting: "#C22E28",
	poison: "#A33EA1",
	ground: "#E2BF65",
	flying: "#A98FF3",
	psychic: "#F95587",
	bug: "#A6B91A",
	rock: "#B6A136",
	ghost: "#735797",
	dragon: "#6F35FC",
	dark: "#705746",
	steel: "#B7B7CE",
	fairy: "#D685AD",
};

// PlayerPokeData:
// {
// 	"name": "Charizard",
// 	"id": 6,
// 	"max_hp": 78,
// 	"current_hp": 48,
// 	isFainted: 0,
// 	"type": "fire",
// 	"back": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png",
// 	"moves": [
// 		{ name: "flamethrower",
// 		power: 90,
// 		type: "fire",
// 		id: 53 },
// 		{ name: "fire-blast",
// 		power: 110,
// 		type: "fire",
// 		id: 126 },
// 		{ name: "slash",
// 		power: 70,
// 		type: "normal",
// 		id: 163 },
// 		{ name: "dragon-rage",
// 		power: 40,
// 		type: "dragon",
// 		id: 82 }
// 	]
// }

// EnemyPokeData:
// {
// 	"name": "Blastoise",
// 	"id": 9,
// 	"max_hp": 79,
// 	"current_hp": 79,
// 	isFainted: 0,
// 	"type": "water",
// 	"front": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/9.png",
// 	"moves": [
// 		{ name: "water-gun",
// 		power: 40,
// 		type: "water",
// 		id: 55 },
// 		{ name: "hydro-pump",
// 		power: 110,
// 		type: "water",
// 		id: 56 },

let playerTeam = JSON.parse(localStorage.getItem("playerTeam"));
let enemyTeam = JSON.parse(localStorage.getItem("enemyTeam"));
let canplay = false;
let activePlayer = 0;
let activeEnemy = 0;
let playerFaits = 0;
let enemyFaits = 0;
let cheatCode = 0;

let playerMovesData = [];
let enemyMovesData = [];

async function fetchMoves(id) {
	const API_URL = `https://pokeapi.co/api/v2/move/${id}`;
	const response = await fetch(API_URL);
	const data = await response.json();
	const power = data.power;
	const type = data.type.name;
	const name = data.name;
	const move_id = data.id;
	const move = { name, power, type, move_id };
	return move;
}

async function fetchPokemonMoves() {
	for (let i = 0; i < 5; i++) {
		let movesTemp = [];
		for (let j = 0; j < playerTeam[0].moves.length; j++) {
			const move = await fetchMoves(playerTeam[i].moves[j]);
			movesTemp.push(move);
		}
		playerMovesData.push(movesTemp);
	}
	for (let i = 0; i < 5; i++) {
		let movesTemp = [];
		for (let j = 0; j < enemyTeam[0].moves.length; j++) {
			const move = await fetchMoves(enemyTeam[i].moves[j]);
			movesTemp.push(move);
		}
		enemyMovesData.push(movesTemp);
	}
}

async function displayMoves() {
	await fetchPokemonMoves();
	const top_team_el = document.querySelectorAll(".top-team ul li");
	const enemy_poke_el = document.querySelector(".enemy-pokemon img");
	const player_poke_el = document.querySelector(".player-pokemon img");
	const player_right_team = document.querySelectorAll(".right-team ul li");
	const player_abilities_button = document.querySelectorAll(
		".player-abilities button"
	);

	// INITIALISING THE POKEMON (for Cheat Code)
	top_team_el.forEach((el, index) => {
		el.querySelector("img").src = enemyTeam[index].front;
		el.id = "enemy-" + index;
		el.addEventListener("click", () => {
			if (cheatCode === 0 && el.id.slice(-1) && canplay) {
				cheatCode = 1;
				DisplayText("Cheat Code Activated", 2000);
			}
		});
	});

	// INITIALISING THE POKEMON
	player_poke_el.src = playerTeam[0].back;
	enemy_poke_el.src = enemyTeam[0].front;

	// ADDING EVENT LISTENERS TO THE BUTTONS
	player_abilities_button.forEach((el, index) => {
		el.addEventListener("click", () => {
			useAbility(index, true);
		});
	});

	// UPDATING THE PLAYER BUTTON'S NAME AND COLOUR
	updatePlayerButton();

	// ADDING EVENT LISTENERS TO THE LEFT TEAM SWITCHING
	player_right_team.forEach((el, index) => {
		el.id = "player-" + index;
		el.querySelector("img").src = playerTeam[index].front;
		el.addEventListener("click", async () => {
			if (canplay) {
				if (!playerTeam[activePlayer].isFainted) {
					canplay = false;
				}
				const chosen_id = el.id.slice(-1);
				if (chosen_id == activePlayer) {
					await DisplayText("This Pokemon is already active", 2000);
					canplay = true;
				} else {
					if (playerTeam[chosen_id].isFainted) {
						await DisplayText(
							"This Pokemon is fainted, please choose another",
							4000
						);
						canplay = true;
					} else {
						const lastChosen = activePlayer;
						activePlayer = chosen_id;
						updatePlayerButton();
						await switchPokemon(true);
						await healthBar(true, true);
						await sleep(1000);
						playPokeSound(playerTeam[activePlayer].cries.latest);
						await DisplayText(
							`Player switched to ${capitalizeFirstLetter(
								playerTeam[activePlayer].name
							)}`,
							3000
						);
						if (!playerTeam[lastChosen].isFainted) {
							enemyTurn();
						} else {
							document.querySelector(".display-text p").innerText =
								"You can play now!";
						}
					}
				}
			}
		});
	});

	// UPDATING THE HEALTH BARS
	await healthBar(true, true);
	await healthBar(false, true);

	// PLAYING THE BATTLE MUSIC
	await playBattleMusic("play");

	// DISPLAYING THE GAME HAS LOADED
	await DisplayText(`GAME HAS LOADED`, 2000);
	await DisplayText(`It's your turn!`, 1000);
	canplay = true;
	
}

displayMoves();
let battleAudio = null;

function updatePlayerButton() {
	const player_abilities_button = document.querySelectorAll(
		".player-abilities button"
	);
	player_abilities_button.forEach((el, index) => {
		el.id = "move-" + index;
		el.innerText = playerMovesData[activePlayer][index].name;
		el.style.backgroundColor =
			colours[playerMovesData[activePlayer][index].type];
	});
}

// HELPER FUNCTIONS --------------------------------------------------------------------------------------------

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDivider() {
	const randomNum = Math.floor(Math.random() * 101);
	// 10% CHANCE OF CRITICAL HIT
	if (randomNum <= 10) {
		return 5;
	} else {
		return 10;
	}
}

// AUDIO FUNCTIONS --------------------------------------------------------------------------------------------

async function playHitSound() {
	const audio = new Audio(`./src/audio/Bongo.mp3`);
	audio.volume = 0.5;
	audio.play();
	console.log("audio");
}

async function playWinSound() {
	const audio = new Audio(`./src/audio/Win.mp3`);
	audio.volume = 0.3;
	audio.play();
}

async function playPokeSound(soundUrl) {
	const audio = new Audio(soundUrl);
	audio.volume = 0.05;
	audio.play();
}

async function playCriticalSound() {
	const audio = new Audio(`./src/audio/Critical.mp3`);
	audio.volume = 0.3;
	audio.play();
}

async function playBattleMusic(action) {
	if (battleAudio === null && action === "play") {
		battleAudio = new Audio("./src/audio/Battle.mp3");
		battleAudio.className = "battle-audio";
		battleAudio.loop = true;
		battleAudio.volume = 0.05;
		battleAudio.play();
	}
	if (action === "pause" && battleAudio !== null) {
		battleAudio.pause();
	}
}

// PLAYING THE GAME --------------------------------------------------------------------------------------------

async function DisplayText(text, time) {
	const player_menu_text = document.querySelector(".display-text p");
	player_menu_text.textContent = text;
	await sleep(time).then(() => {
		player_menu_text.textContent = "";
	});
}
async function healthBar(forPlayer, ifSwitched) {
	const player_health_bar = document.querySelector(".pokemon-stats");
	const enemy_health_bar = document.querySelector(".enemy-stats");
	const player_poke_name = document.querySelector(".pokemon-name");
	const enemy_poke_name = document.querySelector(".enemy-name");
	const player_hp_meter = player_health_bar.querySelector(".pokemon-hp-meter");
	const enemy_hp_meter = enemy_health_bar.querySelector(".enemy-hp-meter");
	let side_player_circle = document.querySelectorAll(".right-team li img")[activePlayer]

	if (forPlayer) {
		// GETTING INFO
		const player_current = player_health_bar.querySelector(".current-hp");
		const player_max = player_health_bar.querySelector(".max-hp");
		let player_hp_perc = 0;
		if (playerTeam[activePlayer].current_hp <= 0) {
			player_current.innerHTML = 0;
			player_hp_perc = 1;
		} else {
			player_current.innerHTML = playerTeam[activePlayer].current_hp;
			player_hp_perc = (
				(playerTeam[activePlayer].current_hp /
					playerTeam[activePlayer].max_hp) *
				100
			).toFixed(0);
		}

		// UPDATING INFO
		player_max.innerHTML = "/" + playerTeam[activePlayer].max_hp;
		player_hp_meter.style.width = player_hp_perc + "%";




		// HELP PLS
		const gradient = `linear-gradient(180deg, #FC0504 ${player_hp_perc}%, #2cd829 ${player_hp_perc}%)`
		console.log(gradient)
		console.log(side_player_circle.style)
		side_player_circle.style.backgroundColor = gradient







		//CHANGING COLOUR
		if (player_hp_perc <= 20) {
			player_hp_meter.style.backgroundColor = "red";
		} else if (player_hp_perc <= 50) {
			player_hp_meter.style.backgroundColor = "yellow";
		} else {
			player_hp_meter.style.backgroundColor = "var(--Health-Green)";
		}
		// CHANGING NAME
		if (ifSwitched) {
			player_poke_name.innerHTML = capitalizeFirstLetter(
				playerTeam[activePlayer].name
			);
		}
	} else if (!forPlayer) {
		const enemy_current = enemy_health_bar.querySelector(".current-hp");
		const enemy_max = enemy_health_bar.querySelector(".max-hp");
		let enemy_hp_perc = 0;
		if (enemyTeam[activeEnemy].current_hp <= 0) {
			enemy_current.innerHTML = 0;
			enemy_hp_perc = 1;
		} else {
			enemy_current.innerHTML = enemyTeam[activeEnemy].current_hp;
			enemy_hp_perc =
				(enemyTeam[activeEnemy].current_hp / enemyTeam[activeEnemy].max_hp) *
				100;
		}
		// UPDATING INFO
		enemy_max.innerHTML = "/" + enemyTeam[activeEnemy].max_hp;
		enemy_hp_meter.style.width = enemy_hp_perc + "%";
		if (enemy_hp_perc <= 20) {
			enemy_hp_meter.style.backgroundColor = "red";
		} else if (enemy_hp_perc <= 50) {
			enemy_hp_meter.style.backgroundColor = "yellow";
		} else {
			enemy_hp_meter.style.backgroundColor = "var(--Health-Green)";
		}
		// CHANGING NAME
		if (ifSwitched) {
			enemy_poke_name.innerHTML = capitalizeFirstLetter(
				enemyTeam[activeEnemy].name
			);
		}
	}
}

async function useAbility(id, fromPlayer) {
	if (canplay && !playerTeam[activePlayer].isFainted && canplay) {
		canplay = false;
		const divider = getDivider();
		let damage = playerMovesData[0][id].power / divider;
		if (cheatCode === 1) {
			damage = damage * 1000;
		}
		damage = damage.toFixed(0);
		await DisplayText(
			`Player's ${playerTeam[activePlayer].name} used ${playerMovesData[activePlayer][id].name}`,
			3000
		);
		enemyTeam[activeEnemy].current_hp -= damage;

		// PLAYING SOUND
		if (divider === 5) {
			playCriticalSound();
			await DisplayText("Critical Hit!", 3000);
		} else {
			playHitSound();
		}

		// UPDATING INFO
		healthBar(false, false);
		await DisplayText(
			`Enemy's ${capitalizeFirstLetter(
				enemyTeam[activeEnemy].name
			)} took ${damage} damage`,
			4000
		);
		checkFainted();
		// ENEMY PLAYS AFTER PLAYER TURN
		enemyTurn();
	}
	if (!fromPlayer && !enemyTeam[activeEnemy].isFainted) {
		const name = enemyMovesData[activeEnemy][id].name;
		// FOR 10% CHANCE OF CRITICAL HIT

		// DISPLAYING ENEMY MOVE
		await DisplayText(
			`Enemy's ${capitalizeFirstLetter(
				enemyTeam[activeEnemy].name
			)} used ${name}`,
			3000
		);

		// CALCULATING DAMAGE
		const divider = getDivider();
		const damage = (enemyMovesData[activeEnemy][id].power / divider).toFixed(0);
		playerTeam[activePlayer].current_hp -= damage;
		
		// PLAYING SOUND
		if (divider === 5) {
			playCriticalSound();
			await DisplayText("Critical Hit... Big L for You", 3000);
		} else {
			playHitSound();
		}
		// UPDATING INFO
		healthBar(true, false);
		await DisplayText(
			`Player's ${playerTeam[activePlayer].name} took ${damage} damage`,
			2000
		);
		checkFainted();
		// PLAYER PLAYS AFTER ENEMY TURN
		canplay = true;
		if (!playerTeam[activePlayer].isFainted) {
			document.querySelector(".display-text p").innerText = "It's your turn!";
		}
	}
}

async function checkFainted() {
	const enemy_poke_el = document.querySelector(".enemy-pokemon img");
	const player_poke_el = document.querySelector(".player-pokemon img");

	if (playerTeam[activePlayer].current_hp <= 0) {
		playerTeam[activePlayer].isFainted = 1;
		playPokeSound(playerTeam[activePlayer].cries.latest);
		playerFaits++;
		player_poke_el.src = "";
		await DisplayText(
			`Player's ${playerTeam[activePlayer].name} has fainted`,
			2000
		);
		document.querySelector(".display-text p").innerText =
			"Choose Another Pokemon!";
		if (playerFaits === 5) {
			await DisplayText("You have lost the battle", 7000);
			returnHome();
		}
	}
	if (enemyTeam[activeEnemy].current_hp <= 0) {
		enemyTeam[activeEnemy].isFainted = 1;
		playPokeSound(enemyTeam[activeEnemy].cries.latest);
		enemy_poke_el.src = "";
		await DisplayText(
			`Enemy's ${enemyTeam[activeEnemy].name} has fainted`,
			4000
		);
		enemyFaits++;
		console.log("Enemy faints are " + enemyFaits);
		if (enemyFaits === 5) {
			playBattleMusic("pause");
			playWinSound();
			await DisplayText("You have won the battle", 7000);
			returnHome()
		} else {
			console.log("Enemy Switched RIGHT NOW");
			// Make ENEMY CHOOSE NEW POKEMON
			activeEnemy++;
			await healthBar(false, true);
			await switchPokemon();
			await DisplayText(
				`Enemy switched to ${capitalizeFirstLetter(
					enemyTeam[activeEnemy].name
				)}`,
				3000
			);
			// ENEMY PLAYS AFTER DEATH
			enemyTurn();
		}
	}
}

async function switchPokemon(fromPlayer) {
	const enemy_poke_el = document.querySelector(".enemy-pokemon img");
	const player_poke_el = document.querySelector(".player-pokemon img");
	if (fromPlayer) {
		console.log("Player Switched BACK");
		player_poke_el.src = playerTeam[activePlayer].back;
		updatePlayerButton();
	} else {
		console.log("Enemy Switched BACK");
		enemy_poke_el.src = enemyTeam[activeEnemy].front;
	}
}

function enemyTurn() {
	console.log("ENEMY TURN and canplay is " + canplay);
	if (!canplay) {
		const randomMove = Math.floor(Math.random() * 4);
		useAbility(randomMove, false);
	}
}

async function returnHome() {
	await DisplayText("Returning to home page", 5000);
	localStorage.removeItem("playerTeam");
	localStorage.removeItem("enemyTeam");
	window.location.href = "index.html";
}
