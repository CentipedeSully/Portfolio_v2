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

let isInputValid = false;
let queryIngredientName ='';
let queryChemicalName = '';
let queryChemicalMin =0;
let queryChemicalMax=999;
let queryChemicalQty=1;

let chemicalQueryData = [];

let queryContext = "search";
let sortStyle = "alphabetical";
let logCount = 0;

const fileReader =new FileReader();


//Input references
let inputArea = document.getElementById("input-field");

let ingredientInputName = document.getElementById("ingredient-name-input");
ingredientInputName.addEventListener("input",validateIngredientNameInput);

let chemicalInputName = document.getElementById("chemical-name-input");
chemicalInputName.addEventListener("input",validateChemicalNameInput)

let chemicalMinInput = document.getElementById("chem-min-input");
let chemicalMaxInput = document.getElementById("chem-max-input");
let chemicalAmountInput = document.getElementById("chem-amount-input");


//HTML Container references
let ingredientQueryContainer = document.getElementById("ingredient-query-container");
ingredientQueryContainer.addEventListener('click', (event) =>{

    //Don't reload the page!!
    event.preventDefault();

    //check if the element is a valid ingredient element
    if (event.target.classList.contains("query-ingredient")){
        
        //remove the element from the dom
        ingredientQueryContainer.removeChild(event.target);

        //replace the removed ingredient with a generic, unclickable substitude
        buildIngredientQueryElement("");
    }
});

let chemicalQueryContainer = document.getElementById("chemical-query-container");
chemicalQueryContainer.addEventListener('click', (event) => {
    
    //Dont reload the page!!
    event.preventDefault();

    //check if the element is a valid chemical element
    if (event.target.classList.contains("query-chemical")){

        //remove the element from the dom
        chemicalQueryContainer.removeChild(event.target);

        console.log("chem removal requested!");
    }
});


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



let clearQueryBtn = document.getElementById("clear-query-btn");
clearQueryBtn.addEventListener("click",clearQuery);

let addToQueryBtn = document.getElementById("add-to-query-btn");
addToQueryBtn.addEventListener("click", updateQuery);

let submitQueryBtn = document.getElementById("submit-query-btn");
submitQueryBtn.addEventListener("click", submitQueryForm);



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

        //Change query bg color
        inputArea.setAttribute("class","bg-secondary-subtle rounded col-12");

        //disable&Enable proper fields
        toggleElements("query-bounds-info",true);
        toggleElements("query-qty-info",false);

    }
}

function enterAddContext(){
    if (queryContext !== "add"){
        queryContext= "add";

        //Change query bg color
        inputArea.setAttribute("class","bg-success-subtle rounded col-12");

        //disable&Enable proper fields
        toggleElements("query-bounds-info",false);
        toggleElements("query-qty-info",true);
    }
}

function enterRemoveContext(){
    if (queryContext !== "remove"){
        queryContext= "remove";

        //Change query bg color
        inputArea.setAttribute("class","bg-danger-subtle rounded col-12");

        //disable&Enable proper fields
        toggleElements("query-bounds-info",false);
        toggleElements("query-qty-info",false);
    }
}



//input validation-related
function validateIngredientNameInput(){
    //don't allow commas in the ingredient name
    if ((ingredientInputName.value).match(/,+/g)){
        lockSubmission();
    }
    else unlockSubmission();
}

function validateChemicalNameInput(){
    //don't allow commas in the chemical name
    if ((chemicalInputName.value).match(/,+/g)){
        lockSubmission();
    }
    else unlockSubmission();
}

function lockSubmission(){
    isInputValid = false;
    addToQueryBtn.setAttribute("disabled","true");
}

function unlockSubmission(){
    isInputValid = true;
    addToQueryBtn.removeAttribute("disabled");
}



//Query related
function buildIngredientQueryElement(name){

    let isIngredientBlank = false;
    //default the name to "any Ingredient" if empty
    if (name ==="")
        isIngredientBlank = true;


    //create the element
    let newIngredientElement = document.createElement("button");

    //disable the button if the ingredient wasn't specified
    if (isIngredientBlank)
        newIngredientElement.setAttribute("disabled",true);

    newIngredientElement.setAttribute("input","button");
    newIngredientElement.setAttribute("class","query-ingredient col-3 rounded btn btn-secondary");
    newIngredientElement.setAttribute("id",`ingredient-${name}`);
    ingredientQueryContainer.append(newIngredientElement);

    //create the child container element
    let childDiv = document.createElement("div");
    childDiv.setAttribute("class","row justify-content-center pe-none");
    newIngredientElement.appendChild(childDiv);

    //create the innermost child text element
    spanElement = document.createElement("span");
    spanElement.setAttribute("class","col text-center");

    if (name ==="")
        spanElement.innerText = `(any)`;

    else 
        spanElement.innerText=  `${name}`;

    childDiv.appendChild(spanElement);

}

function buildChemicalQueryElement(name, amount, min, max){

    //create the element 
    let newChemElement = document.createElement("button");
    newChemElement.setAttribute("input","button");
    newChemElement.setAttribute("class","query-chemical col-2 col-sm-3 col-xs-3 rounded btn btn-secondary btn-sm ");
    newChemElement.setAttribute("id",`chemical-${name}`);
    chemicalQueryContainer.appendChild(newChemElement);

    //create child container element
    let childContainer = document.createElement("div");
    childContainer.setAttribute("class","row justify-content-between pe-none");
    newChemElement.appendChild(childContainer);

    //create name text element
    let nameSpan = document.createElement("span");
    nameSpan.setAttribute("class","col text-center query-name-info");
    nameSpan.innerText =`${name}`;
    childContainer.appendChild(nameSpan);

    //create bounds text element
    let boundsSpan = document.createElement("span");
    boundsSpan.setAttribute("class","col text-center query-bounds-info");
    boundsSpan.innerText = `[${min}-${max}]`;
    childContainer.appendChild(boundsSpan);

    //create amount text element
    let qtySpan = document.createElement("span");
    qtySpan.setAttribute("class","col text-center query-qty-info");
    qtySpan.innerText = `${amount}`;
    childContainer.appendChild(qtySpan);


    //hide the appropriate elements, based on the current context
    if (queryContext == "search"){
        //hide the qty info
        qtySpan.classList.add("d-none");
    }

    else if (queryContext == "add"){
        //hide the bounds info
        boundsSpan.classList.add("d-none");
        
    }

    else if (queryContext == "remove"){
        //hide both bounds and qty info
        qtySpan.classList.add("d-none");
        boundsSpan.classList.add("d-none");

    }

}

function toggleElements(elementClass, newState){
    let elements = document.getElementsByClassName(elementClass);

    for (let i = 0; i < elements.length; i++){

        if (newState){
            //only attempt class removal if the tag exists
            if (elements[i].classList.contains("d-none"))
                elements[i].classList.remove("d-none");
        }

            
        else {
            //only add the class tag if it isn't present
            if (!elements[i].classList.contains("d-none"))
                elements[i].classList.add("d-none");
        }
            
    }

}

function clearQuery(){

    //clear the input fields
    ingredientInputName.value="";
    chemicalInputName.value="";
    chemicalMinInput.value =1;
    chemicalMaxInput.value =999;
    chemicalAmountInput.value=1;

    //erase all dynamic query html
    while (ingredientQueryContainer.hasChildNodes())
        ingredientQueryContainer.removeChild(ingredientQueryContainer.firstChild);


    while (chemicalQueryContainer.hasChildNodes())
        chemicalQueryContainer.removeChild(chemicalQueryContainer.firstChild);

    //unlock the submission buttons
    if (!isInputValid)
        unlockSubmission();
}

function updateQuery(){

    //read the new query data
    queryIngredientName = ingredientInputName.value;
    queryChemicalName = chemicalInputName.value;
    queryChemicalMin = chemicalMinInput.value;
    queryChemicalMax = chemicalMaxInput.value;
    queryChemicalQty = chemicalAmountInput.value;

    if (queryChemicalQty === null || queryChemicalQty === undefined)
        queryChemicalQty = 0;
    if (queryChemicalMin === null || queryChemicalMin === undefined)
        queryChemicalMin = 0;
    if (queryChemicalMax === null || queryChemicalMax === undefined)
        queryChemicalMax =999;


    //update the ingredient HTML
    if (ingredientQueryContainer.childElementCount > 0)
        ingredientQueryContainer.removeChild(ingredientQueryContainer.firstElementChild);

    buildIngredientQueryElement(queryIngredientName);

    
    //is our current chem input valid?
    if (queryChemicalName !== ""){
        
        //update the preexisting html, if any exists
        if (chemicalQueryContainer.childElementCount > 0){

            let matchFound = false;
    
            //look for any preexisting elements that match our current chemical query
            for (let i=0; i < chemicalQueryContainer.children.length; i++){
    
                //is a match found?
                if (chemicalQueryContainer.children[i].id === `chemical-${queryChemicalName}`)
                {
                    matchFound = true;
    
                    //update the html of the preexisting element
                    let chemElement = chemicalQueryContainer.children[i];
                    chemElement.getElementsByClassName("query-bounds-info")[0].innerText = `[${queryChemicalMin}-${queryChemicalMax}]`;
                    chemElement.getElementsByClassName("query-qty-info")[0].innerText = `${queryChemicalQty}`;
    
                    break;
                }
            }
    
            if (!matchFound){
                buildChemicalQueryElement(queryChemicalName,queryChemicalQty,queryChemicalMin,queryChemicalMax);
            }
        }

        //otherwise, create a new html element representing this chemical item
        else buildChemicalQueryElement(queryChemicalName,queryChemicalQty,queryChemicalMin,queryChemicalMax);

    }    
}

function submitQueryForm(){

    //Read chemical query data
    readChemicalQueryData();

    //create a log for the action
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

        //lastly, scroll to the display
        document.getElementById("full-display-area").scrollIntoView({
            behavior: "smooth",
            block: "center",

        });

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



//Table-related utilities

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



//Log functions


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
    logDisplay.appendChild(newLogElement);

    //update log count
    logCount++;

    //update the log's scroll top
    logDisplay.scrollTop = logDisplay.scrollHeight;

    //scroll to the latest log entry
    newLogElement.scrollTo({
        top: logDisplay.scrollHeight,
        behaviour: "smooth"
    });
}

function readChemicalQueryData(){
    //Clear the old query
    chemicalQueryData.length = 0;

    for (let i=0; i < chemicalQueryContainer.children.length; i++){
        //Build a new chem query object
        let chemData = new ChemicalEntryData;

        //console.log(`${chemicalQueryContainer.children[i].getElementsByClassName("query-name-info")[0]}`);
        //Read the chem's name element
        chemData.name = chemicalQueryContainer.children[i].getElementsByClassName("query-name-info")[0].innerText.trim();

        //read the chem's value element
        chemData.value = Number(chemicalQueryContainer.children[i].getElementsByClassName("query-qty-info")[0].innerText);
        
        //read the chem's bounds element
        let chemBoundsString= chemicalQueryContainer.children[i].getElementsByClassName("query-bounds-info")[0].innerText.slice(1,-1); //remove the brackets -> [m,M]
        let chemBoundsArr= chemBoundsString.split('-');

        let chemMinBoundInput = Number(chemBoundsArr[0]);
        let chemMaxBoundInput = Number(chemBoundsArr[1]);

        //accept the bounding values. Swap if they're illogical
        chemData.minBound = Math.min(chemMinBoundInput,chemMaxBoundInput);
        chemData.maxBound = Math.max(chemMinBoundInput,chemMaxBoundInput);


        //Add the data to the query collection
        chemicalQueryData.push(chemData);
        
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
