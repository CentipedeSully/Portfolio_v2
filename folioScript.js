//dom elements
var cardContainer = document.getElementById("card-container");
var projectCards = document.getElementsByClassName("project-card");
var viewBtns = document.getElementsByClassName("view-btn");


//subscribe all buttons to their necessary functionality
var btnParentContainer = document.getElementById("btn-parent-container");
btnParentContainer === null || btnParentContainer === void 0 ? void 0 : btnParentContainer.addEventListener("click", function (event) {
    
    console.log("onClick event triggered!");
    
    //only respond to element nodes
    if (event.target instanceof HTMLElement) {

        
        //further only look at buttons
        if (event.target.classList.contains("view-btn")) {
            if (event.target.classList.contains("all-cards-btn")) {
                showAllCards();
                toggleSelectButtons("all-cards-btn");
            }
            else if (event.target.classList.contains("web-cards-btn")) {
                showOnlySelectCards("web-card");
                toggleSelectButtons("web-cards-btn");
            }
            else if (event.target.classList.contains("game-cards-btn")) {
                showOnlySelectCards("game-card");
                toggleSelectButtons("game-cards-btn");
            }
            else if (event.target.classList.contains("wip-cards-btn")) {
                showOnlySelectCards("wip-card");
                toggleSelectButtons("wip-cards-btn");
            }
        }
    }
});


//show all cards by default
document.addEventListener("DOMContentLoaded", function () {
    showAllCards();
    toggleSelectButtons("all-cards-btn");
});



//functions
function showAllCards() {
    for (var i = 0; i < projectCards.length; i++) {
        //Only remove the 'hidden' class name if the name exists
        if (projectCards[i].classList.contains("d-none")) {
            projectCards[i].classList.remove("d-none");
        }
    }
}


function showOnlySelectCards(className) {
    for (var i = 0; i < projectCards.length; i++) {
        //only unhide cards of the specified class
        if (projectCards[i].classList.contains(className)) {
            //Only remove the 'hidden' class name if the name exists
            if (projectCards[i].classList.contains("d-none")) {
                projectCards[i].classList.remove("d-none");
            }
        }
        //else, hide the card
        else {
            //Only add the 'hidden' class if it doesn't yet exist
            if (!projectCards[i].classList.contains("d-none")) {
                projectCards[i].classList.add("d-none");
            }
        }
    }
}


function toggleSelectButtons(className) {
    for (var i = 0; i < viewBtns.length; i++) {
        //only visually toggle the buttons of the specified class
        if (viewBtns[i].classList.contains(className)) {
            //Only 'select' buttons that aren't already selected
            if (!viewBtns[i].classList.contains("selected")) {
                viewBtns[i].classList.add("selected");
                viewBtns[i].classList.add("btn-secondary");
                viewBtns[i].classList.remove("btn-outline-secondary");
            }
        }
        //else, untoggle the button if it doesn't match
        else {
            //Only 'unselect' buttons that aren't already selected
            if (viewBtns[i].classList.contains("selected")) {
                viewBtns[i].classList.remove("selected");
                viewBtns[i].classList.remove("btn-secondary");
                viewBtns[i].classList.add("btn-outline-secondary");
            }
        }
    }
}
