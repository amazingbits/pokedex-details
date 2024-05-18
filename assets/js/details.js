const typeColors = {
	normal: '#A8A878',
	fire: '#F08030',
	water: '#6890F0',
	electric: '#F8D030',
	grass: '#78C850',
	ice: '#98D8D8',
	fighting: '#C03028',
	poison: '#A040A0',
	ground: '#E0C068',
	flying: '#A890F0',
	psychic: '#F85888',
	bug: '#A8B820',
	rock: '#B8A038',
	ghost: '#705898',
	dragon: '#7038F8',
	dark: '#705848',
	steel: '#B8B8D0',
	dark: '#EE99AC',
};

const statsMap = {
	hp: 'HP',
	attack: 'ATK',
	defense: 'DEF',
	'special-attack': 'SATK',
	'special-defense': 'SDEF',
	speed: 'SPD',
};

const pokemonHeaderNameInput = document.querySelector('.dw-name p');
const pokemonHeaderIDInput = document.querySelector('.dw-name span');
const pokemonTypesInput = document.querySelector('.dw-pokemon-types');
const pokemonWeightInput = document.querySelector('.dw-weight');
const pokemonHeightInput = document.querySelector('.dw-height');
const pokemonMovesInput = document.querySelector('.dw-pokemon-move');
const pokemonStatsInput = document.querySelector('.dw-pokemon-stats');

const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');

let pokemonID = null;
let pokemon = null;

async function loadPokemonInformationsFromAPI(pokemonID) {
	try {
		const response = await fetch(`${POKEAPI_URL}/pokemon/${pokemonID}`);
		const responseJSON = await response.json();
		pokemon = formatPokemonInformation(responseJSON);
	} catch (error) {
		console.error('An error occurred while loading API data', error);
		return;
	}
}

function formatPokemonInformation(pokemonObject) {
	const {name, id, types, weight, height, abilities, stats} = pokemonObject;
	const pokemon = [];
	pokemon.name = capitalizeFirstLetter(name);
	pokemon.height = `${(height / 10).toFixed(2)}m`;
	pokemon.weight = `${(weight / 10).toFixed(2)}kg`;

	pokemon.abilities = [];
	abilities.forEach(({ability}) => {
		pokemon.abilities.push({name: capitalizeFirstLetter(ability.name)});
	});

	pokemon.types = [];
	types.forEach(({type}) => {
		pokemon.types.push({name: capitalizeFirstLetter(type.name), color: typeColors[type.name]});
	});

	pokemon.stats = [];
	stats.forEach(({stat, base_stat}) => {
		const percent = +((base_stat / MAX_POKEMON_STAT_NUMBER) * 100).toFixed(2);
		pokemon.stats.push({name: statsMap[stat.name], value: base_stat, percent});
	});

	return {name, id, types, weight, height, abilities, stats, ...pokemon};
}

document.addEventListener('DOMContentLoaded', async () => {
	const queryParamID = new URLSearchParams(window.location.search).get('id');
	const id = Number(queryParamID);

	if (isNaN(queryParamID) || id <= 0 || id > MAX_POKEMON_NUMBER_LIMIT) {
		window.location.href = HOME_URL;
		return;
	}

	pokemonID = id;

	// Pagination
	const prevID = id - 1 <= 0 ? MAX_POKEMON_NUMBER_LIMIT : id - 1;
	const nextID = id + 1 > MAX_POKEMON_NUMBER_LIMIT ? 1 : id + 1;
	prevButton.href = `/details.html?id=${prevID}`;
	nextButton.href = `/details.html?id=${nextID}`;

	await loadPokemonInformationsFromAPI(id);
	await displayPokemonDetails(pokemon);
});

async function downloadPokemonImage(pokemonID) {
	const imageURL = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`;
	const img = await fetch(imageURL);
	const imgBlob = await img.blob();
	return URL.createObjectURL(imgBlob);
}

async function displayPokemonTypes(pokemon) {
	pokemonTypesInput.innerHTML = '';
	pokemon.types.forEach(({name, color}) => {
		const pokemonType = document.createElement('div');
		pokemonType.classList.add('dw-pokemon-type');
		pokemonType.style.backgroundColor = color;
		pokemonType.innerHTML = name;
		pokemonTypesInput.appendChild(pokemonType);
	});
}

async function displayPokemonAbout(pokemon) {
	pokemonWeightInput.innerHTML = pokemon.weight;
	pokemonHeightInput.innerHTML = pokemon.height;
	let html = '';
	pokemon.abilities.forEach(({name}) => {
		html += `<span>${name}</span>`;
	});
	pokemonMovesInput.innerHTML = html;
	const cards = document.querySelectorAll('.dw-card');
	cards.forEach(cardElement => {
		cardElement.classList.remove('loading');
	});
}

async function displayPokemonStats(pokemon) {
	const color = pokemon.types[0].color;
	const statsElements = document.querySelectorAll('.dw-pokemon-stat');
	for (let i = 0; i < statsElements.length; i++) {
		const statElement = statsElements[i];
		const stat = pokemon.stats[i];
		if (statElement.classList.contains('loading')) {
			statElement.innerHTML = `
                <span>${stat.name}</span>
                <div class="progress-bar pb-hp">
                    <div class="progress" style="width: ${stat.percent}%; background-color: ${color};"></div>
                </div>
            `;
			statElement.classList.remove('loading');
		}
	}
}

async function displayPokemonDetails(pokemon) {
	if (!document.querySelector('.dw-pokemon-image').classList.contains('loading')) {
		document.querySelector('.dw-pokemon-image').classList.add('loading');
	}
	console.log(pokemon);

	// Header
	pokemonHeaderNameInput.innerHTML = pokemon.name;
	pokemonHeaderIDInput.innerHTML = `#${pokemon.id}`;

	//Title
	document.querySelector('title').textContent = `Pokemon Details - ${pokemon.name}`;

	// Background color
	document.querySelector('.background').style.backgroundColor = pokemon.types[0].color;

	// Pokemon image
	const pokemonImageURL = await downloadPokemonImage(pokemon.id);
	document.querySelector('.dw-pokemon-image img').src = pokemonImageURL;
	document.querySelector('.dw-pokemon-image').classList.remove('loading');

	// Types
	await displayPokemonTypes(pokemon);

	// About
	await displayPokemonAbout(pokemon);

	// Stats
	await displayPokemonStats(pokemon);
}
