const clientId = '92f6470830994065a22b1ecf2476d3da';
const clientSecret = 'jL1x28Gs7DKCE86ugMeO5E74jUvHl3Eg';
const region = 'us';

let gearData = { 1: {}, 2: {} };
let statTotals = {
    1: { strength: 0, agility: 0, intellect: 0, stamina: 0, crit: 0, haste: 0, mastery: 0, versatility: 0 },
    2: { strength: 0, agility: 0, intellect: 0, stamina: 0, crit: 0, haste: 0, mastery: 0, versatility: 0 }
};

async function fetchComparisonGear(characterNum) {
    const characterName = document.getElementById(`characterName${characterNum}`).value.toLowerCase();
    const realm = document.getElementById(`realm${characterNum}`).value.toLowerCase();

    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Failed to obtain access token.');
        }

        const apiUrl = `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${characterName}/equipment?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`;
        console.log(`Fetching data for Character ${characterNum} from:`, apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching gear data: ${response.status} ${response.statusText}\n${errorText}`);
        }
        const data = await response.json();
        console.log(`Received data for Character ${characterNum}:`, data);
        gearData[characterNum] = data;
        displayGear(characterNum);
    } catch (error) {
        console.error(`Error in fetchComparisonGear for Character ${characterNum}:`, error);
        alert(`Error fetching gear data for Character ${characterNum}: ${error.message}`);
    }
}

async function getAccessToken() {
    try {
        const response = await fetch(`https://oauth.battle.net/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Authentication error: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        console.log('Received access token:', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Error in getAccessToken:', error);
        return null;
    }
}

// ... (keep existing code)

function displayIndividualGear(data) {
    const gearBody = document.getElementById('gearBody');
    gearBody.innerHTML = ''; // Clear existing data

    const charHeader = document.getElementById('characterHeader');
    charHeader.innerText = `${data.character.name} - Level ${data.character.level}`;

    let statTotals = {
        itemLevel: 0, strength: 0, agility: 0, intellect: 0, stamina: 0,
        crit: 0, haste: 0, mastery: 0, versatility: 0
    };

    data.equipped_items.forEach(item => {
        const row = document.createElement('tr');
        const stats = getItemStats(item);
        
        row.innerHTML = `
            <td>${item.slot.type}</td>
            <td>${item.name}</td>
            <td>${item.level.value}</td>
            <td>${stats.strength}</td>
            <td>${stats.agility}</td>
            <td>${stats.intellect}</td>
            <td>${stats.stamina}</td>
            <td>${stats.crit}</td>
            <td>${stats.haste}</td>
            <td>${stats.mastery}</td>
            <td>${stats.versatility}</td>
            <td><input type="text" class="wish-list-input" placeholder="Wish list item" onchange="updateWishList('${item.slot.type}', this.value)"></td>
        `;
        gearBody.appendChild(row);

        // Update totals
        statTotals.itemLevel += item.level.value;
        for (let stat in stats) {
            statTotals[stat] += stats[stat];
        }
    });

    // Update total row
    document.getElementById('totalItemLevel').textContent = Math.floor(statTotals.itemLevel / data.equipped_items.length);
    for (let stat in statTotals) {
        if (stat !== 'itemLevel') {
            document.getElementById(`total${stat.charAt(0).toUpperCase() + stat.slice(1)}`).textContent = statTotals[stat];
        }
    }

    // Load wish list from localStorage
    loadWishList();
}

function updateWishList(slot, item) {
    let wishList = JSON.parse(localStorage.getItem('wishList')) || {};
    wishList[slot] = item;
    localStorage.setItem('wishList', JSON.stringify(wishList));
    highlightWishListItems();
}

function loadWishList() {
    let wishList = JSON.parse(localStorage.getItem('wishList')) || {};
    for (let slot in wishList) {
        let input = document.querySelector(`tr td:first-child:contains('${slot}') + td + td + td + td + td + td + td + td + td + td + td input`);
        if (input) {
            input.value = wishList[slot];
        }
    }
    highlightWishListItems();
}

function highlightWishListItems() {
    let inputs = document.querySelectorAll('.wish-list-input');
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            input.parentElement.parentElement.classList.add('wish-list-item');
        } else {
            input.parentElement.parentElement.classList.remove('wish-list-item');
        }
    });
}

// ... (keep existing code)

    // Calculate totals
    gearData[characterNum].equipped_items.forEach(item => {
        const stats = getItemStats(item);
        for (let stat in stats) {
            statTotals[characterNum][stat] += stats[stat];
        }
    });

    // Update total row
    for (let stat in statTotals[characterNum]) {
        document.getElementById(`total${stat.charAt(0).toUpperCase() + stat.slice(1)}${characterNum}`).textContent = statTotals[characterNum][stat];
    }
}

function getItemStats(item) {
    const stats = {
        strength: 0,
        agility: 0,
        intellect: 0,
        stamina: 0,
        crit: 0,
        haste: 0,
        mastery: 0,
        versatility: 0
    };

    if (item.stats) {
        item.stats.forEach(stat => {
            switch (stat.type.type) {
                case 'STRENGTH':
                    stats.strength = stat.value;
                    break;
                case 'AGILITY':
                    stats.agility = stat.value;
                    break;
                case 'INTELLECT':
                    stats.intellect = stat.value;
                    break;
                case 'STAMINA':
                    stats.stamina = stat.value;
                    break;
                case 'CRIT_RATING':
                    stats.crit = stat.value;
                    break;
                case 'HASTE_RATING':
                    stats.haste = stat.value;
                    break;
                case 'MASTERY_RATING':
                    stats.mastery = stat.value;
                    break;
                case 'VERSATILITY':
                    stats.versatility = stat.value;
                    break;
            }
        });
    }

    return stats;
}

async function fetchIndividualGear() {
    const characterName = document.getElementById('characterName').value.toLowerCase();
    const realm = document.getElementById('realm').value.toLowerCase();

    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            throw new Error('Failed to obtain access token.');
        }

        const apiUrl = `https://${region}.api.blizzard.com/profile/wow/character/${realm}/${characterName}/equipment?namespace=profile-${region}&locale=en_US&access_token=${accessToken}`;
        console.log('Fetching data from:', apiUrl);

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error fetching gear data: ${response.status} ${response.statusText}\n${errorText}`);
        }
        const data = await response.json();
        console.log('Received data:', data);
        displayIndividualGear(data);
    } catch (error) {
        console.error('Error in fetchIndividualGear:', error);
        alert(`Error fetching gear data: ${error.message}`);
    }
}

function displayIndividualGear(data) {
    const gearBody = document.getElementById('gearBody');
    gearBody.innerHTML = ''; // Clear existing data

    const charHeader = document.getElementById('characterHeader');
    charHeader.innerText = `${data.character.name} - Level ${data.character.level}`;

    let statTotals = {
        strength: 0, agility: 0, intellect: 0, stamina: 0,
        crit: 0, haste: 0, mastery: 0, versatility: 0
    };

    data.equipped_items.forEach(item => {
        const row = document.createElement('tr');
        const stats = getItemStats(item);
        
        row.innerHTML = `
            <td>${item.slot.type}</td>
            <td>${item.name}</td>
            <td>${item.level.value}</td>
            <td>${stats.strength}</td>
            <td>${stats.agility}</td>
            <td>${stats.intellect}</td>
            <td>${stats.stamina}</td>
            <td>${stats.crit}</td>
            <td>${stats.haste}</td>
            <td>${stats.mastery}</td>
            <td>${stats.versatility}</td>
        `;
        gearBody.appendChild(row);

        // Update totals
        for (let stat in stats) {
            statTotals[stat] += stats[stat];
        }
    });

    // Update total row
    for (let stat in statTotals) {
        document.getElementById(`total${stat.charAt(0).toUpperCase() + stat.slice(1)}`).textContent = statTotals[stat];
    }
}
