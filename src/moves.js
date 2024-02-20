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

const localdata = JSON.parse(localStorage.getItem("team"));
const chosenPokemons = localdata.poke;
if (localdata.isEnemy === 1) {
	document.querySelector(".team h2").textContent = "ENEMY TEAM";
} else {
	document.querySelector(".team h2").textContent = "YOUR TEAM";
}
console.log(chosenPokemons);

let chosenPokemonData = [];

async function fetchPokemon(id, index) {
	const API_URL = `https://pokeapi.co/api/v2/pokemon/${id}`;
	const response = await fetch(API_URL);
	const data = await response.json();
	chosenPokemonData.push(data);
	console.log(data);
	display_pokemon(data, index);
}

// DISPLAYING THE POKEMON DATA ----------------------------------------------

const team_card_container = document.querySelector(".team-card-container");

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function display_pokemon(poke, index) {
	const team_card = document.querySelectorAll(".team-card");
	const image = poke.sprites.front_default;
	team_card[index].querySelector(".poke-img").src = image;
	team_card[index].querySelector(".pokenum").textContent = `№ ${poke.id}`;
	team_card[index].querySelector(".pokename").textContent =
		capitalizeFirstLetter(poke.name);
	const types = poke.types.map((type) => type.type.name);
	team_card[index].querySelector(".pokelement").innerHTML = types
		.map(
			(type) =>
				`<img src="./src/incons/${type}_icon.svg" alt="${type + " element"}">`
		)
		.join("");
}

const LoadWebsite = async () => {
	for (let i = 0; i < chosenPokemons.length; i++) {
		await fetchPokemon(chosenPokemons[i], i);
	}
	console.log(chosenPokemonData);
	getMoves();
};

LoadWebsite();

// LOAD MOVES ----------------------------------------------------------------

fight = {};
let chosenPokemonMoveID = [];
let indexPokemon = 0;

const moves_container = document.querySelector(".moves-container");

async function fetchMove(api_url) {
	const response = await (await fetch(api_url)).json();
	displayMove(response);
}

function displayMove(move) {
	const power = move.power;
	const accuracy = move.accuracy;
	if (power && accuracy) {
		const moveEl = document.createElement("div");
		moveEl.classList.add("move-card");
		moveEl.id = `move-id-${move.id}`;
		moveEl.innerHTML = `
            <div class="move-card-col">
                <h3>${capitalizeFirstLetter(move.name)}</h3>
                <p>${power} POW</p>
            </div>
            <div class="move-card-col">
                <img src="./src/incons/${move.type.name}_icon.svg" alt="">
                <p>${accuracy}% ACC</p>
            </div>
        `;
		moveEl.addEventListener("click", () => {
			moveChoose(moveEl, move.id);
		});
		moveEl.style.background = `linear-gradient(110deg, ${
			colours[move.type.name]
		} 55%, var(--text-color) 55%)`;
		moves_container.appendChild(moveEl);
	}
}

function getMoves() {
	const team_cards = document.querySelectorAll(".team-card");
	team_cards[indexPokemon].classList.add("selected");
	chosenPokemonData[indexPokemon].moves.forEach((move) => {
		const url = move.move.url;
		fetchMove(url);
	});
}

// EVENT LISTENER FUNCTION ----------------------------------------------------------

function moveChoose(moveEl, id) {
	if (indexPokemon < 5 && !chosenPokemonMoveID.includes(id)) {
		moveEl.classList.add("selected");
		chosenPokemonMoveID.push(id);
	}
	if (chosenPokemonMoveID.length === 4) {
		console.log(indexPokemon);
		fight[indexPokemon] = {
			id: chosenPokemonData[indexPokemon].id,
			name: chosenPokemonData[indexPokemon].name,
			max_hp: chosenPokemonData[indexPokemon].stats[0].base_stat,
			current_hp: chosenPokemonData[indexPokemon].stats[0].base_stat,
			isFainted: 0,
			type: chosenPokemonData[indexPokemon].types[0].type.name,
			front: chosenPokemonData[indexPokemon].sprites.front_default,
			back: chosenPokemonData[indexPokemon].sprites.back_default,
			moves: chosenPokemonMoveID,
			cries: chosenPokemonData[indexPokemon].cries,
		};
		console.log(fight);
		if (indexPokemon === 4) {
			if (localdata.isEnemy === 0) {
				localStorage.setItem("playerTeam", JSON.stringify(fight));
				const enemyTeam = [...Array(5)].map((e) => ~~(Math.random() * 1000));
				localStorage.removeItem("team");
				localStorage.setItem(
					"team",
					JSON.stringify({ poke: enemyTeam, isEnemy: 1 })
				);
				window.open("./moves.html", "_self");
			} else {
				localStorage.setItem("enemyTeam", JSON.stringify(fight));
				localStorage.removeItem("team");
				window.location.href = "./fight.html";
			}
		}
		chosenPokemonMoveID = [];
		console.log(fight);
		const team_cards = document.querySelectorAll(".team-card");
		team_cards[indexPokemon].classList.remove("selected");
		indexPokemon++;
		console.log(indexPokemon);
		if (indexPokemon < 5) {
			moves_container.innerHTML = "";
			getMoves();
		}
	}
}
