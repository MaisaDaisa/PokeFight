const colours = {
	normal: '#A8A77A',
	fire: '#EE8130',
	water: '#6390F0',
	electric: '#F7D02C',
	grass: '#7AC74C',
	ice: '#96D9D6',
	fighting: '#C22E28',
	poison: '#A33EA1',
	ground: '#E2BF65',
	flying: '#A98FF3',
	psychic: '#F95587',
	bug: '#A6B91A',
	rock: '#B6A136',
	ghost: '#735797',
	dragon: '#6F35FC',
	dark: '#705746',
	steel: '#B7B7CE',
	fairy: '#D685AD',
};

const localdata = JSON.parse(localStorage.getItem('team'))
const chosenPokemons = localdata.poke
console.log(chosenPokemons)

let chosenPokemonData = []
async function fetchPokemon(id) {
    const API_URL = `https://pokeapi.co/api/v2/pokemon/${id}`
    const response = await fetch(API_URL)
    const data = await response.json()
    chosenPokemonData.push(data)
    console.log(data)   
    display_pokemon(data)
}





// DISPLAYING THE POKEMON DATA ----------------------------------------------

const poke_container = document.querySelector('.poke-container')

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function display_pokemon(poke) {
    const poke_card = document.createElement('div')
    poke_card.classList.add('poke-card')
    poke_card.id = `poke-${poke.id}`
    const types = poke.types.map(type => type.type.name)
    poke_card.innerHTML = `
    <div class="pokecard-info">
        <p>#${poke.id }</p>
        <h2>${capitalizeFirstLetter(poke.name)}</h2>
        <div class="poke-elements">
            ${types.map(type => `<img src="./src/incons/${type}_icon.svg" alt="${type + ' element'}">`).join('')}
        </div>
    </div>
    <div class="pokecard-img">
        <img src=${poke.sprites.front_default} alt="Pikachu">
    </div>
    `
    poke_container.appendChild(poke_card) 

}

const LoadWebsite = async () => {
    for (let i = 0; i < chosenPokemons.length; i++) {
        await fetchPokemon(chosenPokemons[i])
    }
    console.log(chosenPokemonData)
    getMoves()
}

LoadWebsite()

// LOAD MOVES ----------------------------------------------------------------

fight = {}
let chosenPokemonMoveID = []
let indexPokemon = 0
const moves_container = document.querySelector('.moves-container')

async function fetchMove(api_url) {
    const response = await (await fetch(api_url)).json()
    displayMove(response)
}

function displayMove(move) {
    const power = move.power
    const accuracy = move.accuracy
    if (power && accuracy) {
        const moveEl = document.createElement('div')
        moveEl.classList.add('move-card')
        moveEl.id = `move-id-${move.id}`
        moveEl.innerHTML = `
            <div class="move-col">
                <h3>${move.name}</h3>
                <p>${power} POW</p>
            </div>
            <div class="move-col">
                <img src="./src/incons/${move.type.name}_icon.svg" alt="">
                <p>${accuracy}% ACC</p>
            </div>
        `  
        moveEl.addEventListener('click', () => {
            moveChoose(moveEl, move.id)
        })
        moveEl.style.backgroundColor = colours[move.type.name]
        moves_container.appendChild(moveEl)
    } 
}

function getMoves() {
    const pokeContainerMulti = document.querySelectorAll('.poke-card')
    pokeContainerMulti[indexPokemon].style.backgroundColor = 'var(--My-Blue)'
    chosenPokemonData[indexPokemon].moves.forEach(move => {
        const url = move.move.url
        fetchMove(url)
    })
}

// EVENT LISTENER FUNCTION ----------------------------------------------------------

function moveChoose(moveEl, id) {
    if (indexPokemon < 5 && !chosenPokemonMoveID.includes(id)) {
        moveEl.style.backgroundColor = 'var(--My-Red)'
        chosenPokemonMoveID.push(id)
    }
    if (chosenPokemonMoveID.length === 4 ) {
        fight[indexPokemon] = { id: chosenPokemonData[indexPokemon].id, 
            name: chosenPokemonData[indexPokemon].name, 
            max_hp: chosenPokemonData[indexPokemon].stats[0].base_stat, 
            current_hp: chosenPokemonData[indexPokemon].stats[0].base_stat, 
            isFainted: 0, type: chosenPokemonData[indexPokemon].types[0].type.name, 
            front: chosenPokemonData[indexPokemon].sprites.front_default, 
            back: chosenPokemonData[indexPokemon].sprites.back_default, 
            moves: chosenPokemonMoveID, 
            cries: chosenPokemonData[indexPokemon].cries
        }
        console.log(fight)
        if (indexPokemon === 4) {
            if (localdata.isEnemy === 0) {
                localStorage.setItem('playerTeam', JSON.stringify(fight))
                const enemyTeam = [...Array(5)].map(e=>~~(Math.random()*1000))
                localStorage.removeItem('team')
                localStorage.setItem('team', JSON.stringify({poke: enemyTeam, isEnemy: 1}))
                window.open('./moves.html', '_self')         
            } else {
                localStorage.setItem('enemyTeam', JSON.stringify(fight))
                localStorage.removeItem('team')
                window.location.href = './fight.html'
            }
        }
        chosenPokemonMoveID = []
        console.log(fight)
        poke_container.querySelectorAll('.poke-card')[indexPokemon].style.backgroundColor = 'var(--Isabelline)'
        indexPokemon++
        if (indexPokemon < 5) {
            moves_container.innerHTML = ''
            getMoves()
        }
    }
    
}

