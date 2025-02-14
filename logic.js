const API_KEY = 'BuoaQ26wWo1Si0B8QDqvvHDPod8aMWoVVT6ekGmP';
const SEARCH_API_URL = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=`;
const DETAILS_API_URL = `https://api.nal.usda.gov/fdc/v1/food/`;

const searchInput = document.getElementById('food-search');
const foodSelect = document.getElementById('food-select');
const nutritionInfo = document.getElementById('nutrition-info');
const addButton = document.getElementById('add-button');
const totalCalories = document.getElementById('total-calories');
const totalProtein = document.getElementById('total-protein');
const totalFat = document.getElementById('total-fat');
const totalCarbs = document.getElementById('total-carbs');
const itemsList = document.getElementById('items-list');
const heightfeild = document.getElementById('height');
const weightfeild = document.getElementById('weight')
const agefeild = document.getElementById('age');
const genfeild = document.getElementById('gen');
const calcbut = document.getElementById('calc');
const req = document.getElementById('calrequiement');
const req2 = document.getElementById('prorequiement')
const actfeild = document.getElementById('act');
let selectedFoods = [];
;

searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length > 2) {
        try {
            const response = await fetch(SEARCH_API_URL + query);
            const data = await response.json();
            console.log('Search Results:', data);
            updateSelect(data.foods);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }
});

foodSelect.addEventListener('change', async () => {
    const fdcId = foodSelect.value;
    if (fdcId) {
        try {
            const response = await fetch(`${DETAILS_API_URL}${fdcId}?api_key=${API_KEY}`);
            const foodDetails = await response.json();
            console.log('Food Details:', foodDetails);
            displayNutritionInfo(foodDetails);
        } catch (error) {
            console.error('Error fetching food details:', error);
        }
    }
});

addButton.addEventListener('click', () => {
    const fdcId = foodSelect.value;
    if (fdcId) {
        const selectedOption = foodSelect.options[foodSelect.selectedIndex];
        const foodDetails = {
            fdcId,
            description: selectedOption.text,
            nutrients: {
                calories: parseFloat(document.querySelector('#nutrition-info p:nth-child(2) strong').nextSibling.textContent),
                protein: parseFloat(document.querySelector('#nutrition-info p:nth-child(3) strong').nextSibling.textContent),
                fat: parseFloat(document.querySelector('#nutrition-info p:nth-child(4) strong').nextSibling.textContent),
                carbs: parseFloat(document.querySelector('#nutrition-info p:nth-child(5) strong').nextSibling.textContent)
            }
        };
        selectedFoods.push(foodDetails);
        addItemToList(foodDetails.description, foodDetails);
        updateTotalNutrition();
    }
});

calcbut.addEventListener('click', () => {
    actvalue = {sedentry:1.2,light:1.375,moderate:1.55,veryactive:1.725,insane:1.9}
    const aclevel = actfeild.value
    const age = parseFloat(agefeild.value);
    const height = parseFloat(heightfeild.value);
    const weight = parseFloat(weightfeild.value);
    const gen = genfeild.value;
    let pro = 0
    let cal = 0;
    if(gen==='M'){cal = (88.362 + (13.397*weight)+(4.799*height)-(5.677*age))*actvalue[aclevel];}
    else if(gen==='F'){cal = (447.593 + (9.247*weight)+(3.098*height)-(4.330*age))*actvalue[aclevel];}
    pro = weight*0.65*actvalue[aclevel];
    req.innerHTML = `Required Calories: ${cal.toFixed(2)} kcal`;
    req2.innerHTML = `Advised Minimum Protein: ${pro.toFixed(2)} g`

})


function updateSelect(foods) {
    foodSelect.innerHTML = '';
    foods.forEach(food => {
        const option = document.createElement('option');
        option.value = food.fdcId;
        option.textContent = food.description;
        foodSelect.appendChild(option);

    });
    nutritionInfo.style.display = 'none'; // Hide nutrition info when updating the select
}

function displayNutritionInfo(foodDetails) {
    console.log('Nutrients:', foodDetails.foodNutrients); // Log the nutrients for debugging

    const calories = foodDetails.foodNutrients.find(n => n.nutrient.id === 1008);
    const protein = foodDetails.foodNutrients.find(n => n.nutrient.id === 1003);
    const fat = foodDetails.foodNutrients.find(n => n.nutrient.id === 1004);
    const carbs = foodDetails.foodNutrients.find(n => n.nutrient.id === 1005);
    console.log(fat)
    nutritionInfo.innerHTML = `
        <h3>${foodDetails.description}</h3>
        <p><strong>Calories:</strong> ${calories.amount} kcal</p>
        <p><strong>Protein:</strong> ${protein.amount} g </p>
        <p><strong>Fat:</strong> ${fat.amount} g</p>
        <p><strong>Carbohydrates:</strong> ${carbs.amount} g</p>
    `;
    nutritionInfo.style.display = 'block'; // Show nutrition info box
}

function addItemToList(description, food) {
    const listItem = document.createElement('li');
    listItem.className = 'list-item'; // Add a class for styling
    listItem.textContent = description;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-button'; // Add a class for styling
    removeButton.onclick = function() {
        removeItemFromList(listItem, food);
    };

    listItem.appendChild(removeButton);
    itemsList.appendChild(listItem);
}

function removeItemFromList(listItem, food) {
    itemsList.removeChild(listItem);
    selectedFoods = selectedFoods.filter(item => item !== food);
    updateTotalNutrition();
}

function updateTotalNutrition() {
    const totals = selectedFoods.reduce((acc, food) => {
        acc.calories += food.nutrients.calories;
        acc.protein += food.nutrients.protein;
        acc.fat += food.nutrients.fat;
        acc.carbs += food.nutrients.carbs;
        return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });

    totalCalories.textContent = totals.calories.toFixed(2);
    totalProtein.textContent = totals.protein.toFixed(2);
    totalFat.textContent = totals.fat.toFixed(2);
    totalCarbs.textContent = totals.carbs.toFixed(2);

    // Update the chart
    updateNutritionChart(totals);
}

function updateNutritionChart(totals) {
    const ctx = document.getElementById('nutritionChart').getContext('2d');
    console.log('Updating chart with totals:', totals); // Debugging log
    const data = {
        labels: ['Protein', 'Fat', 'Carbohydrates'],
        datasets: [{
            data: [totals.protein, totals.fat*2, totals.carbs],
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0'],
        }]
    };

    if (window.nutritionChart instanceof Chart) {
        window.nutritionChart.data = data;
        window.nutritionChart.update();
    } else {
        window.nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
}
