const clientId = '92f6470830994065a22b1ecf2476d3da';
const clientSecret = 'jL1x28Gs7DKCE86ugMeO5E74jUvHl3Eg';
const region = 'us';

let gearData = { 1: {}, 2: {} };
let statTotals = {
    1: { strength: 0, agility: 0, intellect: 0, stamina: 0, crit: 0, haste: 0, mastery: 0, versatility: 0 },
    2: { strength: 0, agility: 0, intellect: 0, stamina: 0, crit: 0, haste: 0, mastery: 0, versatility: 0 }
};

async function fetchCharacterGear(characterNum) {
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
        console.error(`Error in fetchCharacterGear for Character ${characterNum}:`, error);
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

function displayGear(characterNum) {
    const gearBody = document.getElementById('gearBody');
    if (characterNum === 1) {
        gearBody.innerHTML = ''; // Clear only for the first character
    }

    // Reset stat totals for this character
    for (let stat in statTotals[characterNum]) {
        statTotals[characterNum][stat] = 0;
    }

    const charHeader = document.getElementById(`characterHeader${characterNum}`);
    charHeader.innerText = `Character ${characterNum}: ${gearData[characterNum].character.name} - Level ${gearData[characterNum].character.level}`;

    if (characterNum === 1) {
        gearData[characterNum].equipped_items.forEach(item => {
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
        });
    }

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

// New function for individual character gear
async function fetchCharacterGear() {
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
        console.error('Error in fetchCharacterGear:', error);
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
