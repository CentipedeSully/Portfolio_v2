//Class defs
class Ingredient{
    #name = '';
    #chemMap = new Map();

    //chemMap is a Map of (chemicalName, quantity) pairs
    constructor(name, chemMap){
        let isNameValid = isStringValid(name) && !isStringEmpty(name);
        let isChemMapValid = isMapValid(chemMap);

        if ( isNameValid && isChemMapValid)
        {
            this.#name = name.toLowerCase();
            let chemEntriesArry = [...chemMap.entries()]

            //further validate the Map. Only add valid chemical entries, and make the names lower case
            for (let i = 0; i < chemEntriesArry.length; i++){
                let isChemValid = isStringValid(chemEntriesArry[i][0]);
                let isValueValid = isNumberValid(chemEntriesArry[i][1]);
                if ( isChemValid && isValueValid){
                    this.#chemMap.set(chemEntriesArry[i][0].toLowerCase(),chemEntriesArry[i][1]);
                    console.log(`[${chemEntriesArry[i][0]},${chemEntriesArry[i][1]}] added successfully`);
                }
                else {
                    if (!isValueValid && !isChemValid){
                        console.log(`Neither chemical:${chemEntriesArry[i][0]} nor value:${chemEntriesArry[i][1]} are valid chem,value entries`);
                    }
                    else if (!isChemValid){
                        console.log(`Chemical:${chemEntriesArry[i][0]} isn't a valid chem entry`);
                    }
                    else {
                        console.log(`Value:${chemEntriesArry[i][1]} isn't a valid value entry`);
                    }
                    
                }
                    
            };

        }
        else { 
            if ( !isNameValid && !isChemMapValid)
                console.log(`invalid name AND map detected in Ingredient Constructor (name,map): (${name}, ${chemMap})`);
            else if (!isNameValid)
                console.log(`invalid name detected in Ingredient Constructor: ${name}`);
            
            else console.log(`invalid map detected in Ingredient Constructor: ${chemMap}`);
         }

    }

    get name(){ return this.#name;}

    get chemicalValuePairs(){return this.getChemicalPairsViaSubstring("");}

    doesChemicalExist(chemName){
        return this.#chemMap.has(chemName);
    }

    addChemical(name,value){
        let isNameValid = isStringValid(name) && !isStringEmpty(name);
        let isValueValid = isNumberValid(value);  
        if ( isNameValid && isValueValid)
            this.#chemMap.set(name,value);
        else{
            if ( !isNameValid && !isValueValid)
                console.log(`invalid name AND value detected while adding chemical (name,value): (${name}, ${value})`);
            else if (!isNameValid)
                console.log(`invalid name detected while adding Chemical: ${name}`);
            
            else console.log(`invalid value detected while adding Chemical: ${value}`);
        }

    }

    removeChemical(name){
        if (this.doesChemicalExist(name))
            this.#chemMap.delete(name);
    }

    getChemicalValuePair(name){
        if (this.doesChemicalExist(name)){
            return [name, this.#chemMap.get(name)];
        }
    }

    getChemicalPairsViaSubstring(substring){
        //Validate the string
        if (!isStringValid(substring)){
            console.log(`invalid substring detected while getting chemical pairs: ${substring}`);
            return [];
        }

        //Get the chemical names, sorted
        let allChemicalNames = [...this.#chemMap.keys()].sort();
        

        //Build the output arry
        let matchingChemicalPairs = [];

        //Check each chem name. 
        //Add any matches (as a [name,value] pair) to the output arry
        for (let i = 0; i < allChemicalNames.length; i++){
            if (allChemicalNames[i].includes(substring))
                matchingChemicalPairs.push([allChemicalNames[i], this.#chemMap.get(allChemicalNames[i])]);
        }

        //return the output arry
        return matchingChemicalPairs;
    }

    getChemicalPairsViaSubstringAndBounds(substring, minValue = 0, maxValue = 9){
        //Get the sorted, substring-matching pairs
        let unboundMatches = this.getChemicalPairsViaSubstring(substring);

        //Build the output arry
        let matchingPairsWithinBounds = [];

        //Check each match. 
        //Add any pairs whose values fall within the bounds to the output arry
        for (let i = 0; i < unboundMatches.length; i ++){
            if ((minValue <= unboundMatches[i][1]) && ( unboundMatches[i][1] <= maxValue))
                matchingPairsWithinBounds.push(unboundMatches[i]);
        }

        //return the output arry
        return matchingPairsWithinBounds;
    }
}

class ChemicalEntryData{
    name = '';
    value = 1;
    minBound=1;
    maxBound=Number.MAX_VALUE;
}

//Internal state-tracking Declarations
let ingredientCollection = [];
let displayedIngredientCollection = [];
let ingredientsOnDisplayCount = 0;
let chemicalEntriesCount = 0;
let queryIngredientName ='';
let chemicalQueryData = [];
let queryContext = "search";
let sortStyle = "alphabetical";
let logCount = 0;
let isInputValid = false;
const fileReader =new FileReader();


//Input references
let ingredientInputName = document.getElementById("ingredient-name-input");
ingredientInputName.addEventListener("input",validateIngredientNameInput);

let chemEntryContainer = document.getElementById("chemical-entry-container");
chemEntryContainer.addEventListener("input",function(e){

    //make don't allow any commas in the chem inputs
    if (e.target &&  (e.target.value).match(/,+/g)){
        isInputValid = false;
        submitQueryBtn.setAttribute("disabled","true");
    }
    else{
        isInputValid = true;
        submitQueryBtn.removeAttribute("disabled");
    }
})


//Button References
let importBtn = document.getElementById("import-btn");
importBtn.addEventListener("click",importFile);
let exportBtn = document.getElementById("export-btn");
exportBtn.addEventListener("click",buildAndDownloadIngredientCsv);



let searchContextBtn = document.getElementById("search-context-btn");
searchContextBtn.addEventListener("click",enterSearchContext);

let addContextBtn = document.getElementById("add-context-btn");
addContextBtn.addEventListener("click", enterAddContext);

let removeContextBtn = document.getElementById("remove-context-btn");
removeContextBtn.addEventListener("click", enterRemoveContext);



let addChemEntryBtn = document.getElementById("add-chem-entry-btn");
addChemEntryBtn.addEventListener("click",createChemEntryElement);

let removeChemEntryBtn = document.getElementById("remove-chem-entry-btn");
removeChemEntryBtn.addEventListener("click", removeLastChemEntry);



let submitQueryBtn = document.getElementById("submit-query-btn");
submitQueryBtn.addEventListener("click", submitQueryForm);
let clearQueryBtn = document.getElementById("clear-query-btn");
clearQueryBtn.addEventListener("click",clearQuery);

let sortDisplayBtn = document.getElementById("sort-display-btn");
let clearDisplayBtn = document.getElementById("clear-display-btn");
clearDisplayBtn.addEventListener("click",clearDisplay);



let clearLogBtn = document.getElementById("clear-output-log-btn");
clearLogBtn.addEventListener("click",clearLog);



//Display References
let totalDatabasePopulationDisplay = document.getElementById("total-database-population-display");
let currentTablePopulationDisplay = document.getElementById("current-table-population-display");
let displayTableBody = document.getElementById("display-table-body");
let logDisplay = document.getElementById("log-output");



// Helper Functions
//Validation related
function isStringValid(name){
    return name !== null && typeof name === 'string' && name !== undefined;
}

function isNumberValid(value){
    return value !== null && typeof value === "number"  && value !== undefined;
}

function isMapValid(mapParameter){
    return mapParameter !== null && mapParameter instanceof Map  && mapParameter !== undefined;
}

function isStringEmpty(name){
    return name ==="";
}



//Query-context related
function enterSearchContext(){
    if (queryContext !== "search"){
        queryContext= "search";
        addChemBoundsInputs();
        removeChemValueInputs();
    }
}

function enterAddContext(){
    if (queryContext !== "add"){
        queryContext= "add";
        removeChemBoundsInputs();
        addChemValueInputs();
    }
}

function enterRemoveContext(){
    if (queryContext !== "remove"){
        queryContext= "remove";
        removeChemBoundsInputs();
        removeChemValueInputs();
    }
}



//input validation-related
function validateIngredientNameInput(){
    if ((ingredientInputName.value).match(/,+/g)){
        isInputValid = false;
        submitQueryBtn.setAttribute("disabled","true");
    }
    else{
        isInputValid = true;
        submitQueryBtn.removeAttribute("disabled");
    }
}


//Chemical-field related
function buildChemNameInputHTML(chemEntryNumber){
    return `<div class="input-group pb-1 chem-name-container">
        <label class="input-group-text " for="chem${chemEntryNumber}-name">Chem${chemEntryNumber}:</label>
        <input id="chem${chemEntryNumber}-name" name="chem${chemEntryNumber}Name" class="form-control query-input" type="text" placeholder="---">
    </div>`;
}

function buildChemBoundsInputHTML(chemEntryNumber){
    return `<div class="input-group pb-1 min-bound-container">
            <label class="input-group-text" for="chem${chemEntryNumber}-min-bound">Min:</label>
            <input id="chem${chemEntryNumber}-min-bound" name="chem${chemEntryNumber}MinBound" class="form-control query-input chem-bound" type="number" placeholder="---" min="1" size="3">
        </div>
        <div class="input-group max-bound-container">
            <label class="input-group-text " for="chem${chemEntryNumber}-max-bound">Max:</label>
            <input id="chem${chemEntryNumber}-max-bound" name="chem${chemEntryNumber}MaxBound" class="form-control query-input chem-bound" type="number" placeholder="---" min="1" size="3">
        </div>`;
}

function buildChemValueInputHTML(chemEntryNumber){
    return `<label class="input-group-text " for="chem${chemEntryNumber}-value">Qty:</label>
        <input id="chem${chemEntryNumber}-value" name="chem${chemEntryNumber}Value" class="form-control query-input chem-value" type="number" placeholder="1" min="1">`;
}

function buildChemEntryHTML(newChemEntryNumber){
    if (queryContext === "search"){
        return `${buildChemNameInputHTML(newChemEntryNumber)}
        <div class="pb-3 chem-bounds-container">
            ${buildChemBoundsInputHTML(newChemEntryNumber)}
        </div>`;
    }
    else if (queryContext === "add"){
        return `${buildChemNameInputHTML(newChemEntryNumber)}
        <div class="pb-3 chem-value-container">
            ${buildChemValueInputHTML(newChemEntryNumber)}
        </div>`;
        
    }
    else if (queryContext === "remove"){
        return `${buildChemNameInputHTML(newChemEntryNumber)}`;
    }
}

function createChemEntryElement(){
    let chemEntryContainer = document.getElementById("chemical-entry-container");
    let newChemEntry = document.createElement("div");
    newChemEntry.setAttribute("id",`chem${chemicalEntriesCount + 1}-entry`);
    newChemEntry.setAttribute("class","chem-entry");
    chemEntryContainer.append(newChemEntry);
    newChemEntry.innerHTML= buildChemEntryHTML(chemicalEntriesCount + 1); // Offset chem entry# by 1
    chemicalEntriesCount++;
}

function doesChemEntryExist(chemEntryNumber){
    let foundElement = document.getElementById(`chem${chemEntryNumber}-entry`);
    return foundElement !== null;
}

function getChemEntryElement(chemEntryNumber){
    return document.getElementById(`chem${chemEntryNumber}-entry`);
}

function removeEntry(chemEntryNumber){
    if (doesChemEntryExist(chemEntryNumber)){
        getChemEntryElement(chemEntryNumber).remove();
        
        chemicalEntriesCount--;
    }
}

function removeLastChemEntry(){
    if (chemicalEntriesCount > 0)
        removeEntry(chemicalEntriesCount);
}

function removeChemBoundsInputs(){
    //Get every chemical entry, and then remove every html occurence of a Bound Container
    let chemEntryContainers = document.getElementsByClassName("chem-entry");
    for (let i=0; i < chemEntryContainers.length; i++){
        let boundContainers = chemEntryContainers[i].getElementsByClassName("chem-bounds-container");
        for (let j = boundContainers.length -1; j >=0 ;j--){
            boundContainers[j].remove();
        }
    }
}

function addChemBoundsInputs(){
    let entryElements = document.getElementsByClassName("chem-entry");
    for (let i=0; i < entryElements.length;i++){
        let newDivElement = document.createElement("div");
        newDivElement.setAttribute("class","pb-3 chem-bounds-container")
        newDivElement.innerHTML= buildChemBoundsInputHTML(i+1); //offset chem entry# by +1
        entryElements[i].append(newDivElement);
    }
    
}

function removeChemValueInputs(){
    let chemEntryContainers = document.getElementsByClassName("chem-entry");
    for (let i=0; i < chemEntryContainers.length; i++){
        let valueContainers = chemEntryContainers[i].getElementsByClassName("chem-value-container");
        for (let j = valueContainers.length -1; j >=0 ;j--){
            valueContainers[j].remove();
        }
    }

}

function addChemValueInputs(){
    let entryElements = document.getElementsByClassName("chem-entry");
    for (let i=0; i < entryElements.length;i++){
        let newDivElement = document.createElement("div");
        newDivElement.setAttribute("class","input-group pb-3 chem-value-container")
        newDivElement.innerHTML= buildChemValueInputHTML(i+1); //offset chem entry# by +1
        entryElements[i].append(newDivElement);
    }
}



//Table-related utilities
/* Incorrect Table-Element Building Implementations
function buildTableEntryHtml(entryIndex, ingredient){

    //Begin building the html string
    let tableEntryHtml = '';

    //cache the array of chemical entries
    let chemValuePairArry = ingredient.chemicalValuePairs;

    for (let i = 0; i < chemValuePairArry.length; i++){

        //Build the ingredient row if it's the first iteration
        if (i === 0){
            tableEntryHtml += `<tr class="ingredient-row chemical-row">
            <td class="index-cell">${entryIndex}</td>
            <td class="ingredient-cell">${ingredient.name}</td>
            <td class="chemical-cell">${chemValuePairArry[i][0]}</td>
            <td class="value-cell">${chemValuePairArry[i][1]}</td>
        </tr>`;
            
        }


        //Otherwise build a chemical row
        else {
            tableEntryHtml += `<tr class="chemical-row">
            <td class="index-cell">${entryIndex}</td>
            <td class="ingredient-cell"></td>
            <td class="chemical-cell">${chemValuePairArry[i][0]}</td>
            <td class="value-cell">${chemValuePairArry[i][1]}</td>
        </tr>`;
            
        }
    }

    //return the html string
    return tableEntryHtml;
}

function createTableElement(ingredient){
    //Make sure the ingredient is valid
    if (ingredient === null || ingredient === undefined)
        return;

    //Create new empty element
    let newTableEntry = document.createElement("div");

    //Update the element's attributes into a useable container
    newTableEntry.setAttribute("id",`table-entry${ingredientsOnDisplayCount + 1}`);
    newTableEntry.setAttribute("class","table-entry");

    //Add the element to the table
    displayTableBody.append(newTableEntry);

    //Build the element's inner HTML
    newTableEntry.innerHTML= buildTableEntryHtml(ingredientsOnDisplayCount + 1, ingredient);

    //update the internal display count
    ingredientsOnDisplayCount++;

    //Update the displayed count of table items
    currentTablePopulationDisplay.value = ingredientsOnDisplayCount;

    //add ingredient to the internally-cached display collection
    displayedIngredientCollection.push(ingredient);
}

function removeTableElement(entryIndex){
    
    //Make sure this entry exists
    let tableEntry = document.getElementById(`table-entry${entryIndex}`);
    if (tableEntry === null)
        return;

    //Identify this entry's ingredient: look at the "ingredient-cell"'s value
    let ingredientName = tableEntry.getElementsByClassName('ingredient-cell')[0].value;
    console.log(`Removing ingredient: ${ingredientName}`);

    //remove the entry from the table
    tableEntry.remove();

    //update the internal display count
    ingredientsOnDisplayCount--;

    //update the displayed count of table items
    currentTablePopulationDisplay.value = ingredientsOnDisplayCount;

    //Remove the entry from the inernally-cached "Ingredients on display" collection
    for (let i=0; i < displayedIngredientCollection.length; i++){
        if (ingredientName === displayedIngredientCollection[i].name){
            console.log(`table display arry before deletion @ index ${i}:\n ${displayedIngredientCollection}`);
            displayedIngredientCollection.splice(i,1);
            console.log(`after deletion @ index ${i}:\n ${displayedIngredientCollection}`);
            break;
        }
    }

}

function clearAllTableEntries(){
    //remove each table entry
    for (let i=0; i < ingredientsOnDisplayCount; i++){
        removeTableElement(i+1);
    }
}
*/

function createIngredientRowElement(entryIndex,ingredientName, chemValuePair){
    //create the new table element
    let newTableRow = document.createElement("tr");

    //Update the element's attributes into a valid ingredientRow
    newTableRow.setAttribute("class","ingredient-row table-row");

    //create the element's innerHtml
    let tableEntryHtml = `<td class="index-cell">${entryIndex}</td>
            <td class="ingredient-cell">${ingredientName}</td>
            <td class="chemical-cell">${chemValuePair[0]}</td>
            <td class="value-cell">${chemValuePair[1]}</td>`;

    //Setup the element's inner HTML
    newTableRow.innerHTML = tableEntryHtml;

    //Append the row onto the table
    displayTableBody.append(newTableRow);
}

function createChemicalRowElement(entryIndex,chemValuePair){
    //create the new table element
    let newTableRow = document.createElement("tr");

    //Update the element's attributes into a valid ingredientRow
    newTableRow.setAttribute("class","chemical-row table-row");
  
    //create the element's innerHtml
    let tableEntryHtml = `<td class="index-cell">${entryIndex}</td>
            <td class="ingredient-cell"></td>
            <td class="chemical-cell">${chemValuePair[0]}</td>
            <td class="value-cell">${chemValuePair[1]}</td>`;

    //Setup the element's inner HTML
    newTableRow.innerHTML = tableEntryHtml;

    //Append the row onto the table
    displayTableBody.append(newTableRow);
}

function displayIngredient(ingredient){
    //Validate our ingredient
    if (ingredient === null || ingredient === undefined){
        return;
    }

    //Cache the chem value pairs
    let chemValuePairsArry = ingredient.chemicalValuePairs;

    //infer this ingredient's display index. Cached for clarity
    let entryIndex = ingredientsOnDisplayCount + 1; // Start counting at 1, for user readability


    //Build a row for each chemical entry
    for (let i =0; i < chemValuePairsArry.length; i++){

        //The first row of each ingredient is unique: an Ingredient row
        if (i === 0){
            createIngredientRowElement(entryIndex, ingredient.name, chemValuePairsArry[i]);
        } 

        //other rows are chemical rows. They're built different.
        else {
            createChemicalRowElement(entryIndex,chemValuePairsArry[i]);
        }
    }


    //Update display Utils
    ingredientsOnDisplayCount++;

    //Update the displayed count of table items
    currentTablePopulationDisplay.innerText = ingredientsOnDisplayCount;

    //Add ingredient to the interal display cache
    displayedIngredientCollection.push(ingredient);

}

function clearDisplay(){
    //Get all of the rows
    let tableRowsArry = [...displayTableBody.getElementsByClassName("table-row")];

    //cache the number of rows
    let rowCount = tableRowsArry.length;
    while (rowCount > 0)
    {
        //Remove each element
        tableRowsArry.pop().remove();
        rowCount--;
    }

    //Update display Utils
    ingredientsOnDisplayCount=0;

    //Update the displayed count of table items
    currentTablePopulationDisplay.innerText = ingredientsOnDisplayCount;

    //Clear the internal ingredient display collection
    displayedIngredientCollection.length = 0;
}






//Sorting functions
function SortChemsByQuantityInAscendingOrder(nameValuePairArry){

    //sort by "insertion" algorithm
    /*
        1) Sort the first two elements.
        2) for each next element, if the next element is less than the last sorted, then
            swap thier positions. Continue to compare and swap by this new element until it's
            no longer less than it's Leftward neighbor (or until it has no Leftward neighbor).
            
            This works because all Leftward elements (from this new element) have already been
            sorted.
    */

    //cache interation count
    let iterationCount = nameValuePairArry.length;

    //Insertion implementation
    for (let currentIndex =0; currentIndex < iterationCount; currentIndex++){

        //Clarify our values, for readablility
        let sortedValue = nameValuePairArry[currentIndex][1]; // [name,value]
        let unsortedIndex = currentIndex + 1;

        //Make sure next unsorted index exists before attempting to inspect its value
        if (unsortedIndex < iterationCount){
            
            //Enter swap logic if currentSortedValue > unsortedValue && unsortedIndex is withinBounds
            while(sortedValue > nameValuePairArry[unsortedIndex][1] && unsortedIndex > 0){
                
                //clarify the new unsorted value
                let unsortedValue = nameValuePairArry[unsortedIndex][1];

                //move the unsorted Value to the currentSortedValue's position
                nameValuePairArry[unsortedIndex-1][1] = unsortedValue;

                //move the currentSortedValue to the old unsortedValue's position
                nameValuePairArry[unsortedIndex][1] = sortedValue;
                
                //update the unsorted index to match the new unsortedValue's position
                unsortedIndex--;

                //update the old sortedValue into the next-in-line value (if one exists)
                if (unsortedIndex > 0)
                    sortedValue = nameValuePairArry[unsortedIndex - 1][1];
                 
            }
        }
    }
}



//Submission & Clear functions
function clearQuery(){
    let queryInputCollection = document.getElementsByClassName("query-input");
    for (let i = 0; i < queryInputCollection.length; i++)
        queryInputCollection[i].value = "";

    if (!isInputValid)
    {
        isInputValid = true;
        submitQueryBtn.removeAttribute("disabled");
    }
}

function clearLog(){

    //Get all logs
    let logArry = [...logDisplay.getElementsByClassName("log")];

    //remove each log from the document tree
    while(logCount > 0){

        let latestLogElement = logArry.pop();
        latestLogElement.remove();

        logCount--;
    }
}

function logSearchAction(){
    
    //Get ingredient name
    let ingredientName = queryIngredientName;

    //Default ingredient to --- if none was specified within the query
    if (queryIngredientName === ""){ 
        ingredientName = "---"; 
    }

    //create the description string
    let logDescription = `Searched ingredient: ${ingredientName} with ${chemicalQueryData.length} chemical criteria, found ${displayedIngredientCollection.length} results`;
    
    //create the log
    createLog(logDescription);
}


function logAddAction(){

    //create the description string
    let logDescription = `Added/Expanded ingrdient: ${queryIngredientName}`;
    
    //create the log
    createLog(logDescription);
}

function logRemoveAction(){
    //create the description string
    let logDescription = `Removed/Pruned ingrdient: ${queryIngredientName}`;
    
    //create the log
    createLog(logDescription);
}

function logExportAction(){
    //create the description string
    let logDescription = `exported ingredient file containing ${ingredientCollection.length} entries`;

    //create the log
    createLog(logDescription);
}

function buildLogHTML(description){
    return `<div class="log-index border-end col-2 text-center">${logCount + 1}</div>
    <div class="log-text col-10 text-center">${description}</div>`;
}

function createLog(description){
    //Create new log element
    let newLogElement = document.createElement("div");

    //Update attributes into a valid Log
    newLogElement.setAttribute("class","log text-start row row-cols-2");

    //Build inner log HTML
    newLogElement.innerHTML = buildLogHTML(description);

    //set new log within the log Display
    logDisplay.append(newLogElement);

    //update log count
    logCount++;
}

function readChemicalQueryData(chemEntryCollection){
    //Clear the old query
    chemicalQueryData.length = 0;

    for (let i=0; i < chemEntryCollection.length; i++){
        //Build a new chem query object
        let chemData = new ChemicalEntryData;

        //Validate and read the name, numbers, and values
        let chemNameInput = document.getElementById(`chem${i + 1}-name`).value;
        if (isStringValid(chemNameInput) && !isStringEmpty(chemNameInput))
            chemData.name = chemNameInput;
        else {
            //Do not risk adding any empty chemical entries. Move on to the next entry
            break;
        }

        //read the chem value, if it exists
        if (document.getElementById(`chem${i + 1}-value`) !== null){
            let chemValueInput = Number(document.getElementById(`chem${i + 1}-value`).value);

            //default the value to 1
            chemValueInput = Math.max(1,chemValueInput);

            //accept the value
            chemData.value = chemValueInput;
        }
        
        //read the bounds inputs, if they exist
        if (document.getElementById(`chem${i + 1}-min-bound`) !== null && document.getElementById(`chem${i + 1}-max-bound`) !== null){
            let chemMinBoundInput = Number(document.getElementById(`chem${i + 1}-min-bound`).value);
            let chemMaxBoundInput = Number(document.getElementById(`chem${i + 1}-max-bound`).value);

            //default the minBound to 1
            chemMinBoundInput = Math.max(1,chemMinBoundInput); //MinBound will always be >= 1

            //default the maxBound to MAX if it's current value is 0 (due to being left empty)
            if (chemMaxBoundInput === 0){
                chemMaxBoundInput = Number.MAX_VALUE;
            }

            //Otherwise, make the maxBound ALWAYS >= minBound
            chemMaxBoundInput = Math.max(chemMinBoundInput,chemMaxBoundInput);

            //accept the bounding values
            chemData.minBound = chemMinBoundInput;
            chemData.maxBound = chemMaxBoundInput;
        }


        //Add the data to the query collection
        chemicalQueryData.push(chemData);
        
    }
}

function submitQueryForm(){

    //Read Query data: Get ingredient name and chem entry data
    let ingredientName = document.getElementById("ingredient-name-input").value;
    let chemEntryCollection = document.getElementsByClassName("chem-entry");
    console.log(`${chemEntryCollection.length} eentries collected`);

    //Validate ingredient name
    if (!isStringValid(ingredientName))
        ingredientName = '';

    //Add ingredient name to the query
    queryIngredientName = ingredientName;

    //Read chemical query data
    readChemicalQueryData(chemEntryCollection);

    logQueryData();

    if (queryContext === "search"){

        //find all ingredients that match the query
        let ingredientMatches = getAllMatchingIngredients();

        console.log([...ingredientMatches]);

        //clear the display
        clearDisplay();

        //display all matching ingredients
        for (let i=0; i < ingredientMatches.length;i++){
            displayIngredient(ingredientMatches[i]);
        }

        //Log the action to the output area
        logSearchAction();

    }
    else if (queryContext === "add"){
        
        if (queryIngredientName !== '' && chemicalQueryData.length > 0)
        {
            //Add ingredient to data collection
            addQueryIngredientToCollection();

            //Log action to the output area
            logAddAction();

        }
        else if (queryIngredientName === ""){
            alert("Provide an Ingredient Name before submitting an Add query.");
        }
        else {
            alert("Ingredients must contain at least one chemical");
        }
    }
    else if (queryContext === "remove"){

        if (queryIngredientName !== '')
        {
            //Perform the contextual remove operation
            performRemovalQuery();

            //Log action to the output area
            logRemoveAction();

        }
        else {
            alert("Provide an Ingredient Name before submitting a Remove query.");
        }
    }

}

function getAllMatchingIngredients(){
    //Build the collection to hold the matches
    let ingredientMatches = [];

    //Look at each stored ingredient
    for (let i =0; i < ingredientCollection.length;i++){

        //Start Searching by name if a name was provided
        if (queryIngredientName !== ""){

            //First determine if the name matches 
            if (ingredientCollection[i].name.includes(queryIngredientName)){

                //simply return the match if no chemicals were specified
                if (chemicalQueryData.length === 0){
                    ingredientMatches.push(ingredientCollection[i]);
                }

                
                else {
                
                    //Otherwise, determine if each queried chem exists in this ingredient
                    //set a flag to hold our ingredient's validity
                    let doAllChemsExist = true;

                    //Get each chem in this ingredient
                    let ingredientChems = ingredientCollection[i].chemicalValuePairs;

                    //Check if each chemical query exists in this ingredient
                    for (let j =0; j < chemicalQueryData.length; j++){
                        doAllChemsExist = doesIngredientContainChemical(
                            ingredientCollection[i],
                            chemicalQueryData[j].name,
                            chemicalQueryData[j].minBound,
                            chemicalQueryData[j].maxBound);
                        
                        if (!doAllChemsExist){
                            break;
                        }
                    }

                    //Add the ingredient if all chems exist
                    if (doAllChemsExist){
                        ingredientMatches.push(ingredientCollection[i]);
                    }
                }

                
            }
        }

        //Otherwise, Ignore looking at the ingredient's name, and go straight to the ingre's chems 
        else {
            //simply return the match if no chemicals were specified
            if (chemicalQueryData.length === 0){
                ingredientMatches.push(ingredientCollection[i]);
            }

            else {
            
                //Otherwise, determine if each queried chem exists in this ingredient
                //set a flag to hold our ingredient's validity
                let doAllChemsExist = true;

                //Get each chem in this ingredient
                let ingredientChems = ingredientCollection[i].chemicalValuePairs;

                //Check if each chemical query exists in this ingredient
                for (let j =0; j < chemicalQueryData.length; j++){
                    doAllChemsExist = doesIngredientContainChemical(
                        ingredientCollection[i],
                        chemicalQueryData[j].name,
                        chemicalQueryData[j].minBound,
                        chemicalQueryData[j].maxBound);
                    
                    if (!doAllChemsExist){
                        break;
                    }
                }

                //Add the ingredient if all chems exist
                if (doAllChemsExist){
                    ingredientMatches.push(ingredientCollection[i]);
                }
            }
        }
    }

    //return the matching ingredients
    return ingredientMatches;
}

function doesIngredientContainChemical(ingredient, chem, minBound,maxBound){

    let matches = ingredient.getChemicalPairsViaSubstringAndBounds(chem,minBound,maxBound);
    return matches.length > 0;
}

function getIngredientFromCollection(ingredientName){
    
    //make sure the ingredient exists
    if (doesIngredientExistInCollection(ingredientName)){

        for (let i=0; i< ingredientCollection.length; i++){
            if (ingredientCollection[i].name === ingredientName)
                return ingredientCollection[i];
        }
    }

    //otherwise return null
    else return null;
}

function addQueryIngredientToCollection(){
    //Determine if the ingredient already exists in the collection
    let doesIngredientAlreadyExist = doesIngredientExistInCollection(queryIngredientName);

    //Update the preexisting ingredient, if it already exists
    if (doesIngredientAlreadyExist){
        let ingredient = getIngredientFromCollection(queryIngredientName);

        for (let i=0; i< chemicalQueryData.length; i++){
            ingredient.addChemical(chemicalQueryData[i].name, chemicalQueryData[i].value);
        }
    }

    //Otherwise, build a new ingredient from the query
    else {

        //create the new ingredient's chemMap
        let chemMap = new Map();
        for (let i=0; i< chemicalQueryData.length; i++){
            console.log(`Attempting to add chemical: [${chemicalQueryData[i].name}, ${chemicalQueryData[i].value}]`);
            chemMap.set(chemicalQueryData[i].name, chemicalQueryData[i].value);
        }

        //create the new ingredient
        let ingredient = new Ingredient(queryIngredientName, chemMap);

        //Add the new ingredient to the Collection
        ingredientCollection.push(ingredient);

        //update database count display
        totalDatabasePopulationDisplay.innerText = ingredientCollection.length;
    }
}

function doesIngredientExistInCollection(ingredientName){
    for (let i= 0; i < ingredientCollection.length; i++){
        if (ingredientCollection[i].name === ingredientName){
            return true;
        }
    }

    return false;
}

function performRemovalQuery(){
    console.log(`attempting remove operation...`);

    //Ignore the command if the ingredient doesn't exist
    if (!doesIngredientExistInCollection(queryIngredientName)){
        console.log(`ingredient ${queryIngredientName} doesn't exist in the database`);
        return;
    }

    //If valid chemical queries exist, then attempt to remove them from the specified ingredient
    if (chemicalQueryData.length > 0){
        let ingredient = getIngredientFromCollection(queryIngredientName);

        for (let i=0; i < chemicalQueryData.length; i++){
            console.log(`removing chemical:${chemicalQueryData[i].name} from ingredient:${queryIngredientName}...`);
            ingredient.removeChemical(chemicalQueryData[i].name);
        }
    }
    else {
        console.log(`removing ingredient:${queryIngredientName} from the database...`);

        //get the index of the ingredient to remove
        let ingredientToRemove =ingredientCollection.find(element => element.name === queryIngredientName);
        let index = ingredientCollection.indexOf(ingredientToRemove);

        console.log(`ingredient ${queryIngredientName} at index:${index}...`);

        if (isNumberValid(index)){
            //remove the ingredient
            let removedObject = ingredientCollection.splice(index,1);
            console.log(`object removed: ${queryIngredientName}`);

            //update database count display
            totalDatabasePopulationDisplay.innerText = ingredientCollection.length;
        }
    }
}


//File import/export utilities
function importFile()
{
    
    //Get file from document
    let file = document.getElementById('import-input').files[0];

    //Setup event listeners for the various FileReader events
    fileReader.addEventListener('loadstart', logReadStart);
    fileReader.addEventListener('progress', logReadInProgress);
    fileReader.addEventListener('error', logReadError);
    fileReader.addEventListener('abort', logReadAborted);
    fileReader.addEventListener('load', parseFile);
    fileReader.addEventListener('loadend',removeAllReadListeners);

    //begin reading file
    fileReader.readAsText(file);
}

function logReadStart(){
    //note event sequence for debugging purposes
    console.log(`filereader LOADSTART fired`);

    //write to log
    createLog(`Beginning to read imported file`);
}

function logReadInProgress(){
    //note event sequence for debugging purposes
    console.log(`filereader PROGRESS fired`);

    //write to log
    createLog(`Reading imported file...`);
}

function logReadError(){
    //note event sequence for debugging purposes
    console.log(`filereader ERROR fired`);

    //write to log
    createLog(`Error reading file.`);
}

function logReadAborted(){
    //note event sequence for debugging purposes
    console.log(`filereader ABORT fired`);

    //write to log
    createLog(`Reading aborted`);

}

function parseFile(){
    //note event sequence for debugging purposes
    console.log(`filereader LOAD fired`);

    //write to log
    createLog(`Read Successful. Importing content...`);

    
    //split contents by newline chars
    let rows = fileReader.result.split('\n');

    rows.forEach((row)=>{
        console.log(row + "\n");
    })

    //init the current ingredient
    let currentIngredientName = '';
    let ingredientsRead = new Map(); // (key,value) -> (name,IngredientObj)

    //Parse each row!
    rows.forEach((row)=>{
        
        //split the row into its separate columns
        let columns = row.split(',');

        if (columns.length === 3){
            //clarify the positions for what they represent
            let readIngredient = columns[0];
            let chemical = columns[1];
            let value = columns[2];
            //console.log(`Parsing row: Ingre(${readIngredient}), chem(${chemical}), val(${value})`);

            //if the current ingredient isn't set, but this row holds an ingredient...
            if (currentIngredientName === '' && readIngredient !== ""){

                //set this ingredient as the new current ingredient
                currentIngredientName = readIngredient;

                //create a new Ingredient object
                let ingreObj = new Ingredient(readIngredient, new Map());

                //Add chem to the ingredient Obj
                ingreObj.addChemical(chemical, Number(value));

                //Add ingredient to the readMap
                ingredientsRead.set(currentIngredientName,ingreObj);

            }


            //else if the current ingredient IS set, and we have no ingre in this row...
            else if (currentIngredientName !=='' && readIngredient === ''){

                //Find the previous ingredient and add this chemical
                //We use a map here to handle cases where an ingredient is repeated
                ingredientsRead.get(currentIngredientName).addChemical(chemical, Number(value));
            }


            //else if both the current ingredient is set AND an ingredient exists in this row...
            else if (currentIngredientName !=='' && readIngredient !== ''){

                //update the current ingredient
                currentIngredientName = readIngredient;

                //create a new Ingredient object
                let ingreObj = new Ingredient(readIngredient, new Map());

                //Add chem to the ingredient Obj
                ingreObj.addChemical(chemical, Number(value));

                //Add ingredient to the readMap
                ingredientsRead.set(currentIngredientName,ingreObj);

                //console.log(`ingredients read: ${ingredientsRead.size}`);
            }
        }
    })

    //Log the amount of ingredients imported succesfully
    createLog(`${ingredientsRead.size} ingredients Imported (or Updated)!`);

    //Add ingredients to the database
    ingredientsRead.forEach((value,key,map)=>{

        //update the ingredient if it exists
        if (doesIngredientExistInCollection(key)){
            
            //get the read ingredient's chemical list
            let chemValueList = value.chemicalValuePairs;

            //add each chemical of this current read ingredient to the preexisting ingre
            chemValueList.forEach((elem)=>{
                getIngredientFromCollection(key).addChemical(elem[0], Number(elem[1]));
            });            
        }

        //otherwise add it to the collection
        else {
            ingredientCollection.push(value);
        }
    })
}

function removeAllReadListeners(){
    //note event sequence for debugging purposes
    console.log(`filereader LOADEND fired: removing listeners from fileReader`);

    fileReader.removeEventListener('loadstart',logReadStart);
    fileReader.removeEventListener('progress',logReadInProgress);
    fileReader.removeEventListener('error',logReadError);
    fileReader.removeEventListener('abort',logReadAborted);
    fileReader.removeEventListener('load',parseFile);
    fileReader.removeEventListener('loadend',removeAllReadListeners);

    
}



function createCsvStringFromChemValuePairs(chemValueArry){
    //chemValue Arry format: [[name1,value1], [n2,v2], [n3,v3], ...]

    console.log('Passed chemArray: \n' + chemValueArry);

    // initialize the string
    let chemCsvString = '';

    // for each chemical/value pair in the collection
    for (let i=0; i < chemValueArry.length; i++){
        
        //Build this -> ",chemName,chemValue\n" string
        //the starting comma denotes leaving the first position of the csv reserved for ingredient data
        //an empty ingredient position means the current row belongs to the last ingredient read
        
        //console.log(`index:${i}, content:${chemValueArry[i]}`);
        chemCsvString += `,${chemValueArry[i][0]},${chemValueArry[i][1]}\n`;
    }

    //log for debugging
    //console.log('chem CSV demo:\n' + chemCsvString);

    return chemCsvString;

}

function createStringFromIngredient(ingredientObj){
    //initialize csv string 
    let csvString = '';

    // apply the ingredient's name to the string
    csvString += ingredientObj.name;

    // apply the ingredient's chem map to the string
    csvString += createCsvStringFromChemValuePairs(ingredientObj.chemicalValuePairs);

    //log for debugging
    //console.log('Ingredient CSV demo:\n' + csvString);

    return csvString;

}

function buildAndDownloadIngredientCsv(){
    //Initialize main csv content str
    let csvString = '';

    //Build each ingredient into the csv string
    ingredientCollection.forEach(element => {
        csvString += createStringFromIngredient(element)
    });

    //create blob as our new csv file
    let newFile = new Blob([csvString], {type: 'text/csv'});

    //create Url
    let fileURL = URL.createObjectURL(newFile);

    //create anchor
    let fileAnchor = document.createElement("a");

    //populate anchor
    fileAnchor.href = fileURL;
    fileAnchor.download = "SkyIngre.csv";

    //trigger download
    fileAnchor.click();

    //Write Message to Log
    createLog("SkyIngre.csv Created");
}



//Debugging utilities
function logIngredient(ingredient){
    console.log(
        `Logging Ingredient: \n
        Name: ${ingredient.name}\n
        Chemicals: ${ingredient.chemicalValuePairs}\n
        End of Ingredient`);
}

function testStringValidation(){
    let undefinedString;
    let nullString = null;
    let emptyString = '';
    let validString = "I'm a valid string, I swear!";
    let nonstringDataType = 0;
    console.log(
        `Testing string validation...\n
        Is undefined variable valid: ${Ingredient.isStringValid(undefinedString)} (expected: False)\n
        Is null variable valid: ${Ingredient.isStringValid(nullString)} (expected: False)\n
        Is empty string valid: ${Ingredient.isStringValid(emptyString)} (expected: False)\n
        Is valid string valid: ${Ingredient.isStringValid(validString)} (expected: True)\n
        Is nonstring data type valid: ${Ingredient.isStringValid(nonstringDataType)} (expected: False)\n
        End of string validation test`);
}

function testMapValidation(){
    let undefinedMap;
    let nullMap = null;
    let emptyMap = new Map();
    let validMap = new Map().set(["Salt",9]);
    let nonMapDataType = 0;

    console.log(
        `Testing map validation...\n
        Is undefined variable valid: ${Ingredient.isMapValid(undefinedMap)} (expected: False)\n
        Is null variable valid: ${Ingredient.isMapValid(nullMap)} (expected: False)\n
        Is empty map valid: ${Ingredient.isMapValid(emptyMap)} (expected: True)\n
        Is valid map valid: ${Ingredient.isMapValid(validMap)} (expected: True)\n
        Is nonMap data type valid: ${Ingredient.isMapValid(nonMapDataType)} (expected: False)\n
        End of string validation test`);
}

function buildTestIngredient(){
    let name = "test ingredient";
    let chemMap = new Map();
    chemMap.set("salt",1);
    chemMap.set("water",2);
    chemMap.set("saltwater",3);
    chemMap.set("cee",20);
    
    chemMap.set(41, "invalid Number");
    chemMap.set("DEE");
    //console.log(`chemMap: ${[...chemMap.entries()]}\nsize: ${chemMap.size}`);
    //console.log(`chemMap entry 1: ${[...chemMap.entries()][0]}`);

    let ingredient = new Ingredient(name,chemMap);
    logIngredient(ingredient);
    return ingredient;
}

function testAddingDataToIngredient(){
    let ingredient= buildTestIngredient();

    let validChemName = "test Chem";
    let validValue = 4;

    let invalidChemName = "";
    let invalidValue = "four";

    console.log("Attempting to add Invalid Data to ingredient...");
    ingredient.addChemical(validChemName,invalidValue);
    ingredient.addChemical(invalidChemName,validValue);
    ingredient.addChemical();
    ingredient.addChemical(null,null);
    logIngredient(ingredient);
    
    console.log("adding valid data to ingredient...");
    ingredient.addChemical(validChemName,validValue);
    logIngredient(ingredient);

    console.log("updating preexisting value within ingredient...");
    ingredient.addChemical(validChemName, 100);
    logIngredient(ingredient);


}

function testRemovingDataFromIngredient(){
    let ingredient= buildTestIngredient();

    let validChemName = "cee";
    let validValue = 4;

    let invalidChemName = "";
    let invalidValue = "four";

    console.log("attempting to remove nonexistent items from ingredient...");
    ingredient.removeChemical(invalidChemName);
    ingredient.removeChemical(null);
    ingredient.removeChemical();
    logIngredient(ingredient);

    console.log("removing item 'cee' from ingredient...");
    ingredient.removeChemical("cee");
    logIngredient(ingredient);
}

function testIngredientChemSearching(){
    let ingredient = buildTestIngredient();

    let universalSubstring="";
    let substring = "salt";
    let nonexistentSubstring = "NonExistent Chem";
    let undefinedChem;
    let nullChem = null;

    console.log(`Searching for a chems with universal substring '${universalSubstring}' in ingredient:\nResults:\n
    ${ingredient.getChemicalPairsViaSubstring(universalSubstring)}\nEnd of search`);
    console.log(`Searching for a chems with substring '${substring}' in ingredient:\nResults:\n
    ${ingredient.getChemicalPairsViaSubstring(substring)}\nEnd of search`);
    console.log(`Searching for a chems with nonexistent substring '${nonexistentSubstring}' in ingredient:\nResults:\n
    ${ingredient.getChemicalPairsViaSubstring(nonexistentSubstring)}\nEnd of search`);
    console.log(`Searching for a chems with undefined substring '${undefinedChem}' in ingredient:\nResults:\n
    ${ingredient.getChemicalPairsViaSubstring(undefinedChem)}\nEnd of search`);
    console.log(`Searching for a chems with null substring '${nullChem}' in ingredient:\nResults:\n
    ${ingredient.getChemicalPairsViaSubstring(nullChem)}\nEnd of search`);


}

function testIngredientChemBoundSearching(){
    let ingredient = buildTestIngredient();

    let universalSubstring="";
    let substring = "salt";
    let nonexistentSubstring = "NonExistent Chem";
    let undefinedChem;
    let nullChem = null;

    let minBound = 2;
    let maxBound = 3;

    console.log(`Searching for a chems with universal substring '${universalSubstring}' in ingredient (Bounds:(${minBound},${maxBound})):\nResults:\n
    ${ingredient.getChemicalPairsViaSubstringAndBounds(universalSubstring,minBound,maxBound)}\nEnd of search`);
    console.log(`Searching for a chems with substring '${substring}' in ingredient (Bounds:(${minBound},${maxBound})):\nResults:\n
    ${ingredient.getChemicalPairsViaSubstringAndBounds(substring,minBound,maxBound)}\nEnd of search`);
    console.log(`Searching for a chems with nonexistent substring '${nonexistentSubstring}' in ingredient (Bounds:(${minBound},${maxBound})):\nResults:\n
    ${ingredient.getChemicalPairsViaSubstringAndBounds(nonexistentSubstring,minBound,maxBound)}\nEnd of search`);
    console.log(`Searching for a chems with undefined substring '${undefinedChem}' in ingredient (Bounds:(${minBound},${maxBound})):\nResults:\n
    ${ingredient.getChemicalPairsViaSubstringAndBounds(undefinedChem,minBound,maxBound)}\nEnd of search`);
    console.log(`Searching for a chems with null substring '${nullChem}' in ingredient (Bounds:(${minBound},${maxBound})):\nResults:\n
    ${ingredient.getChemicalPairsViaSubstringAndBounds(nullChem,minBound,maxBound)}\nEnd of search`);

    
}

function logQueryData(){
    let entryLogString = '';

    for (let i=0; i < chemicalQueryData.length; i++){
        //create the name component of this substring
        let chemDataString = `${i+1}) ChemName : ${chemicalQueryData[i].name}\n`;

        //create the value component
        chemDataString += `${i+1}) Value : ${chemicalQueryData[i].value}\n`;

        //create the min and max bound components
        chemDataString += `${i+1}) MinBound : ${chemicalQueryData[i].minBound}\n`;
        chemDataString += `${i+1}) MaxBound : ${chemicalQueryData[i].maxBound}\n`;

        //Apply this substring to the main logString
        entryLogString += chemDataString;
    }

    console.log(`
    Current Query:\n
    Ingredient: ${queryIngredientName}\n
    Chemical Entries: \n` 
    + `${entryLogString}`)
}


function testAddingTableElements(){
    let ingredient = buildTestIngredient();


    console.log('Adding test ingredient to table...');
    displayIngredient(ingredient);
}
