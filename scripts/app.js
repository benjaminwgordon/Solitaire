/**
 * Solitaire App
 */
const suits = ["spade", "club", "heart", "diamond"];
const values = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];

class Card{
    constructor(suit, value){
        this.suit = suit;
        this.value = value;
        this.faceUp = false;
    }

    render(){
        const $card = $("<div />").addClass("card");
        $card.append($("<dig />").addClass(`card__suit--${this.suit}`).addClass("card__suit"));
        $card.append($("<div />").text(this.value).addClass("card__value"));
        if(!this.faceUp){
            $card.addClass("card--face-down");
        } else{
            $card.draggable({
                revert:"invalid", 
                revertDuration: 100,
                containment: ".game", 
                snap:false, 
                zIndex:100,
                drag: ()=> {
                    app.game.selectedCard = this;
                    let zIndex = 2;
                    //moves all cards in stack under selected when dragged
                    $.each($card.parent().children().not(".card--face-down"), function(key, value) {
                        $(value).css("left", $card.css("left"))
                            .css("top", $card.css("top"))
                            .css("z-index", ++zIndex)
                    })},
                stop: ()=> {app.game.selectedCard = null; app.game.render()}
            })
        }
        if(this === app.game.selectedCard){
            $card.addClass("card--selected");
        }
        return $card;
    }

    //checks if this card can be moved onto target card
    isValidChild(target){
        if (values.indexOf(this.value) !== values.indexOf(target.value) - 1){
            return false;
        } else{
            if (this.suit === "spade" || this.suit === "club"){
                return target.suit === "heart" || target.suit === "diamond"
            } else{
                return target.suit === "spade" || target.suit === "club"
            }
        }
    }
}

class Deck{
    constructor(){
        this.cards = [];
        this.drawPile = [];
        for (let suit of suits){
            for (let value of values){
                this.cards.push(new Card(suit, value));
            }
        }
    }
    // Fisher-Yates shuffle implementation from https://bost.ocks.org/mike/shuffle/
    shuffle(){
        var m = this.cards.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = this.cards[m];
            this.cards[m] = this.cards[i];
            this.cards[i] = t;
        }
        return this.cards;
    }

    draw(){
        if(!(this.cards.length + this.drawPile.length === 0)){
            const topDeck = this.deal(1)[0];
            this.drawPile.push(topDeck);
            if (this.drawPile.length > 0){
                this.drawPile[this.drawPile.length - 1].faceUp = true;
            }
            app.game.render();
        }
    }

    deal(num){
        if(this.cards.length === 0){
            this.cards = [...this.drawPile.reverse()];
            this.drawPile = [];
        }
        return this.cards.splice(this.cards.length - num);
    }

    render(){
        const $deckAndDraw = $(".deck-and-draw").length > 0 ? $(".deck-and-draw") : $("<div />").addClass("deck-and-draw");
        $deckAndDraw.empty();
        const $deck = ($("<div />").addClass("deck"));
        const $drawPile = ($("<div />").addClass("drawPile"));
        if(this.drawPile[0]){
            $drawPile.append(this.drawPile[this.drawPile.length - 1].render());
            $drawPile.on("click", () => {
                if (!app.game.selectedCard){
                    app.game.selectedCard = this.drawPile[this.drawPile.length - 1];
                } else{
                    app.game.selectedCard = null;
                }
            })
        }
        $deck.on("click", () => {
            this.draw();
        });
        $deckAndDraw.append($deck);
        $deckAndDraw.append($drawPile);
        return $deckAndDraw;
    }
}

class Game{
    constructor(){
        this.deck = new Deck();
        //tableau are the piles of cards dealt at the beginning of the game
        this.tableau = new Tableau(this);
        //foundations are the 4 empty piles that the player builds into throughout the game
        this.foundations = new Foundations();
        this.selectedCard = null;
        this.deck.shuffle();
        this.tableau.deal(this.deck);
    }

    render(){
        const $game = $(".game").length > 0 ? $(".game") : $("<div />").addClass("game");
        const $topRow = $(".top-row").length > 0 ? $(".top-row") : $("<div />").addClass("top-row");
        $game.append($topRow);
        $topRow.append(this.deck.render());
        $topRow.append(this.foundations.render());
        $game.append(this.tableau.render());
        return $game;
    }
}

class Tableau {
    constructor(game){
        this.piles = [[],[],[],[],[],[],[]];
        this.game = game;
    }

    deal(deck){
        for (let i = 0; i < this.piles.length; i++){
            this.piles[i] = this.piles[i].concat(deck.deal(i + 1));
        }
        for(let i = 0; i < this.piles.length; i++){
            this.piles[i][this.piles[i].length - 1].faceUp = true;
        }
    }

    //returns the index of the tableau that the specified card is in, or -1 if the card is not found
    indexOf(card){
        for (let i = 0; i < this.piles.length; i++){
            if (this.piles[i].indexOf(card) !== -1){
                return i;
            }
        }
        return -1;
    }

    //handles clicks on the underlying tableau slot
    handleTableauClick(tableau){
        if(app.game.selectedCard){
            if (tableau.length === 0 && app.game.selectedCard.value === "K"){
                const tableauLocation = app.game.tableau.indexOf(app.game.selectedCard);
                //selected card was in a tableau
                if (tableauLocation !== -1){
                    const indexInTableauPile = app.game.tableau.piles[tableauLocation].indexOf(app.game.selectedCard);
                    tableau.push(...app.game.tableau.piles[tableauLocation].splice(indexInTableauPile));
                    this.checkForEmptyPiles();
                } 
                //selected card was The top card of the draw pile
                else if (app.game.selectedCard === app.game.deck.drawPile[app.game.deck.drawPile.length - 1]){
                    tableau.push(app.game.deck.drawPile.pop());
                }
                app.game.selectedCard = null;
                app.game.render();
            }
        }
        app.game.render();
    }

    //handles clicks on cards within the tableau pile
    handleTableauCardClick(card, tableau){
        if (app.game.selectedCard.isValidChild(card)){
            const tableauLocation = app.game.tableau.indexOf(app.game.selectedCard);
            //selected card was in a tableau
            if (tableauLocation !== -1){
                const indexInTableauPile = app.game.tableau.piles[tableauLocation].indexOf(app.game.selectedCard);
                tableau.push(...app.game.tableau.piles[tableauLocation].splice(indexInTableauPile));
            } 
            //selected card was The top card of the draw pile
            else if (app.game.selectedCard === app.game.deck.drawPile[app.game.deck.drawPile.length - 1]){
                app.game.tableau.piles[app.game.tableau.indexOf(card)].push(app.game.deck.drawPile.pop());
            }
            app.game.selectedCard = null;
        }
        this.checkForEmptyPiles();
        app.game.render();
    }

    render(){
        const $tableauContainer = $(".tableauContainer").length < 1 ? $("<div />").addClass("tableauContainer") : $(".tableauContainer");
        $tableauContainer.empty();
        if (app.game.foundations.isGameWon()){
            $(".tableauContainer").empty().append($("<img />").attr("src", "card_images/YouWin.svg").addClass("win"));
            } else{
            for(let tableau of this.piles){
                const $tableau = $("<div />").addClass("tableau");
                if(tableau.length === 0){
                    $tableau.droppable({
                        drop: ()=>{this.handleTableauClick(tableau)},
                    })
                }
                for(let card of tableau){
                    const $card = card.render();
                    if(card.faceUp && tableau.indexOf(card) === tableau.length - 1){
                        $card.droppable({
                            drop: () => {this.handleTableauCardClick(card, tableau)},
                        });
                    }
                    $card.appendTo($tableau);
                }
                $tableauContainer.append($tableau);
            }
        }
        return $tableauContainer;
    }

    //goes thru tableau piles and flips bottom cards piles face up
    checkForEmptyPiles(){
        for(let pile of this.piles){
            if(pile.length > 0){
                pile[pile.length - 1].faceUp = true;
            }
        }
    }
}

class Foundations {
    constructor(){
        this.piles = [[],[],[],[]];
    }

    isGameWon(){
        for (let pile of this.piles){
            if (pile.length !== 13){
                return false;
            }
        }
        return true;
    }


    validFoundationDrop(foundation){
        return (foundation.length > 0 && (foundation[0].suit === app.game.selectedCard.suit && values.indexOf(app.game.selectedCard.value) === values.indexOf(foundation[foundation.length - 1].value) + 1))
    }

    moveCardToFoundation(foundation){
        const tableauLocation = app.game.tableau.indexOf(app.game.selectedCard);
        //selected card was in a tableau
        if (tableauLocation !== -1){
            const indexInTableauPile = app.game.tableau.piles[tableauLocation].indexOf(app.game.selectedCard);
            foundation.push(app.game.tableau.piles[tableauLocation].pop());
        } 
        //selected card was The top card of the draw pile
        else if (app.game.selectedCard === app.game.deck.drawPile[app.game.deck.drawPile.length - 1]){
            foundation.push(app.game.deck.drawPile.pop());
        }
    }

    handleFoundationClick(foundation){
        //put ace into empty pile
        if ((foundation.length === 0 && app.game.selectedCard.value === "A") || this.validFoundationDrop(foundation)){
            this.moveCardToFoundation(foundation);
        }
        app.game.tableau.checkForEmptyPiles();
        app.game.render();
    }

    render(){
        const $foundationContainer = $(".foundationContainer").length < 1 ? $("<div />").addClass("foundationContainer") : $(".foundationContainer");
        $foundationContainer.empty();
        for(let foundation of this.piles){
            const $foundation = $("<div />").addClass("foundation");
            $foundation.droppable({
                drop:(event, ui)=>{ this.handleFoundationClick(foundation)}
            });
            if(foundation[0]){
                $foundation.addClass("card");
                const $foundationValue = $("<div />").text(foundation[foundation.length - 1].value).addClass("card__value");;
                const $foundationSuit = $("<div />").addClass("card__suit--" + foundation[foundation.length - 1].suit).addClass("card__suit");
                $foundation.append($foundationValue);
                $foundation.append($foundationSuit);
            } else{
                $foundation.removeClass().addClass("foundation--empty");
            }
            $foundationContainer.append($foundation);
        }
        return $foundationContainer;
    }
}

class Menu{
    constructor(){}

    render(){
        const $menu = $(".menu").length > 0 ? $(".menu") : $("<div />").addClass("menu");
        $menu.empty();
        $menu.append($("<img />").addClass("title").attr("src", "card_images/KlondikeSolitaire.svg"));
        $menu.append($("<button />").addClass("new-game").on("click", () => {
            app.game = new Game();
            app.game.render();
        }));
        return $menu;
    }
}

class App{
    constructor(game, menu){
        this.game = game;
        this.menu = menu;
    }

    render(){
        const $app = $("#app").length > 0 ? $("#app") : $("<div />").attr("id", "app");
        $app.empty();
        $app.append(this.menu.render());
        $app.append(this.game.render());
        $("body").append($app);
    }
}


const app = new App(new Game(), new Menu());
app.render();

