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
        const element = document.getElementById(`total${stat.charAt(0).toUpperCase() + stat.slice(1)}${characterNum}`);
        element.textContent = statTotals[characterNum][stat];
        
        // Add highlighting
        element.className = ''; // Reset class
        if (statTotals[characterNum][stat] > 0) {
            switch(stat) {
                case 'crit':
                    element.classList.add('highlight-crit');
                    break;
                case 'haste':
                    element.classList.add('highlight-haste');
                    break;
                case 'mastery':
                    element.classList.add('highlight-mastery');
                    break;
                case 'versatility':
                    element.classList.add('highlight-versatility');
                    break;
            }
        }
    }

    // Calculate and display differences if both characters have been loaded
    if (gearData[1].equipped_items && gearData[2].equipped_items) {
        calculateDifferences();
    }
}

function calculateDifferences() {
    for (let stat in statTotals[1]) {
        const diff = statTotals[2][stat] - statTotals[1][stat];
        const element = document.getElementById(`diff${stat.charAt(0).toUpperCase() + stat.slice(1)}`);
        element.textContent = diff > 0 ? `+${diff}` : diff;
        element.className = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : '');
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
