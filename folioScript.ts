
//dom elements
let cardContainer: HTMLElement | null = document.getElementById("card-container");
let projectCards: HTMLCollectionOf<Element> = document.getElementsByClassName("project-card");
let viewBtns: HTMLCollectionOf<Element> = document.getElementsByClassName("view-btn");


//subscribe all buttons to their necessary functionality
let btnParentContainer : HTMLElement | null = document.getElementById("btn-parent-container");
btnParentContainer?.addEventListener("OnClick", (event) => {

    //only respond to element nodes
    if (event.target instanceof Element){
        
        //further only look at buttons
        if (event.target.classList.contains("view-btn")){

            if (event.target.classList.contains("all-cards-btn"))
            {
                showAllCards();
                toggleSelectButtons("all-cards-btn");
            }
    
            else if (event.target.classList.contains("web-cards-btn")){
                showOnlySelectCards("web-card");
                toggleSelectButtons("web-cards-btn");
            }
    
            else if (event.target.classList.contains("game-cards-btn")){
                showOnlySelectCards("game-card");
                toggleSelectButtons("game-cards-btn");
            }
    
            else if (event.target.classList.contains("wip-cards-btn")){
                showOnlySelectCards("wip-card");
                toggleSelectButtons("wip-cards-btn");
            }
        }
        
    }
})




//show all cards by default
document.addEventListener("DOMContentLoaded", function(){
    
    showAllCards();
    toggleSelectButtons("all-cards-btn");
});



//functions
function showAllCards() : void{
    
    for (let i = 0; i < projectCards.length;i++){

        //Only remove the 'hidden' class name if the name exists
        if (projectCards[i].classList.contains("d-none")){
            projectCards[i].classList.remove("d-none");
        }
    }
}

function showOnlySelectCards(className :string) :void{
    for (let i = 0; i < projectCards.length;i++){

        //only unhide cards of the specified class
        if (projectCards[i].classList.contains(className)){

             //Only remove the 'hidden' class name if the name exists
            if (projectCards[i].classList.contains("d-none")){
                projectCards[i].classList.remove("d-none");
            }
        }

        //else, hide the card
        else{

             //Only add the 'hidden' class if it doesn't yet exist
             if (!projectCards[i].classList.contains("d-none")){
                projectCards[i].classList.add("d-none");
            }
        }
    }
}

function toggleSelectButtons(className :string) :void{
    for (let i = 0; i < viewBtns.length;i++){

        //only visually toggle the buttons of the specified class
        if (viewBtns[i].classList.contains(className)){

            //Only 'select' buttons that aren't already selected
            if (!viewBtns[i].classList.contains("selected")){
                viewBtns[i].classList.add("selected");
            }
        }

        //else, untoggle the button if it doesn't match
        else{

            //Only 'unselect' buttons that aren't already selected
            if (viewBtns[i].classList.contains("selected")){
                viewBtns[i].classList.remove("selected");
            }
        }
    }
}











