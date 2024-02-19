
let count = 0
let filled = false

async function fetchPokemon(id) {
    const API_URL = `https://pokeapi.co/api/v2/pokemon/${id}`
    const response = await fetch(API_URL)
    const data = await response.json()
    display_pokemon(data)
}



// DISPLAYING THE POKEMON DATA ----------------------------------------------
const searched_pokemon = document.querySelector('.searched-pokemon')

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function display_pokemon(poke) {
  
        const poke_card = document.createElement('div')
        poke_card.classList.add('poke-card')
        poke_card.id = `poke-${poke.id}`
        const types = poke.types.map(type => type.type.name)
        poke_card.innerHTML = `
                <img src="${poke.sprites.front_default}" alt="${poke.name+"image"}" class="poke-img">
                <div class="poke-info">
                    <p class="pokenum">№ ${poke.id}</p>
                    <h3 class="pokename">${capitalizeFirstLetter(poke.name)}</h3>
                    <div class="pokelement">
                    ${types.map(type => `<img src="./src/incons/${type}_icon.svg" alt="${type + ' element'}">`).join('')}
                    </div>
                </div>
        `
        searched_pokemon.appendChild(poke_card) 

}

// LOOP POKEMONS -----------------------------------------------------------
const LoadPokemon = async () => {
    const old = count+1
    count += 20
    for (let i = old; i <= count; i++) {
        if (i === 0) continue
        await fetchPokemon(i)
    }
    getCards()
}

LoadPokemon()
let cards = document.querySelectorAll('.poke-card')

// EVent Listeners ----------------------------------------------------------

const loadMore = document.querySelector('.load-more')

loadMore.addEventListener('click', () => {
    LoadPokemon()
})

// Cards Event Listeners ----------------------------------------------------

const contextMenu = document.querySelector('.contextMenu')

let chosen_card = null

function getCards() {
    cards = document.querySelectorAll('.poke-card')
    cards.forEach(card => {
        card.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            contextMenu.style.display = 'block'
            contextMenu.style.left = `${e.pageX}px`
            contextMenu.style.top = `${e.pageY+10}px`
            chosen_card = card
        })
    })
}

document.addEventListener('click', () => {
    contextMenu.style.display = 'none'
    chosen_card = null
})

// ADDING A POKEMON ---------------------------------------------------------

const teamAdd = document.querySelector('.team-add')
const team_card = document.querySelectorAll('.team-card')
const fight_button = document.querySelector('.fight-button button')

let team = []

addToTeam = () => { 
    if (team.length < 5 && !filled) {
        const id = +chosen_card.id.slice(5)
        if (team.includes(id)) {
            alert('You already have this pokemon in your team')
        } else {
            const name = chosen_card.querySelector('h3').innerText
            const image = chosen_card.querySelector('.poke-img').src
            const pokelement = chosen_card.querySelector('.pokelement').innerHTML
            console.log(pokelement)
            team_card[team.length].innerHTML = `
                <img src="${image}" alt="" class="poke-img">
                <div class="poke-info">
                    <p class="pokenum">№ ${id}</p>
                    <h3 class="pokename">${name}</h3>
                    <div class="pokelement">
                        ${pokelement}
                    </div>
                </div>
            `
            team.push(id)
            if (team.length === 5) {
                fight_button.style.display = "inline-block"
                filled = true
            }
        }
    } else {
        alert('Your team is already full')
    } 
}

teamAdd.addEventListener('click', () => {
    addToTeam()
})

// FIGHTING A POKEMON -------------------------------------------------------

fight_button.addEventListener('click', () => {
    localStorage.setItem('team', JSON.stringify({poke : team, isEnemy: 0}))
    window.open('./moves.html', '_self')
})




