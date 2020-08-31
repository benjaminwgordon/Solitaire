/**
 * Solitaire App
 */
const suits = ["spade", "club", "heart", "diamond"];
const values = ['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
class Card{
    constructor(suit, value){
        this.suit = suit;
        this.value = value;
    }

    render(){
        const $card = $("<div />").addClass("card");
        $card.append($("<div />").addClass(`card__suit--${this.suit}`).addClass("card__suit"));
        $card.append($("<div />").text(this.value).addClass("card__value"))
        return $card;
    }

    //checks if this card can be moved onto target card
    isValidChild(target){
        if (values.indexOf(this.value) !== values.indexOf(target.value) - 1){
            console.log(`invalid move target by value:\nfrom: ${this.value} to ${target.value}`);
            return false;
        } else{
            if (this.suit === "spade" || this.suit === "club"){
                if(target.suit === "heart" || target.suit === "diamond"){
                    return true;
                } else{
                    console.log(`invalid move target by suit:\nfrom:${this.suit} to: ${target.suit}`)
                    return false;
                }
            } else{
                if(target.suit === "spade" || target.suit === "club"){
                    return true;
                } else{
                    console.log(`invalid move target by suit:\nfrom:${this.suit} to: ${target.suit}`)
                    return false;
                }
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
        this.drawPile.push(this.deal(1)[0]);
        this.render();
    }

    deal(num){
        return this.cards.splice(0,num);
    }

    render(){
        const $deckAndDraw = $(".deck-and-draw").length > 0 ? $(".deck-and-draw") : $("<div />").addClass("deck-and-draw");
        $deckAndDraw.empty();
        const $deck = ($("<div />").addClass("deck"));
        const $drawPile = ($("<div />").addClass("drawPile"));
        if(this.drawPile[0]){
            $drawPile.append(this.drawPile[this.drawPile.length - 1].render());
            $drawPile.on("click", () => {
                console.log(`called on ${this}`)
                if (!this.selectedCard){
                    this.selectedCard = this.drawPile[this.drawPile.length - 1];
                } else{
                    this.selectedCard = null;
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
    }

    render(){
        const $game = $("<div />").addClass("game");
        $game.append(this.deck.render());
        $game.append(this.foundations.render());
        $game.append(this.tableau.render());
        $("body").append($game);
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

    render(){
        const $tableauContainer = $(".tableauContainer").length < 1 ? $("<div />").addClass("tableauContainer") : $(".tableauContainer");
        $tableauContainer.empty();
        for(let tableau of this.piles){
            const $tableau = $("<div />").addClass("tableau");
            for(let card of tableau){
                $tableau.append(card.render().on("click", () => {
                    if(!game.selectedCard){
                        game.selectedCard = card;
                    } else{
                        if (game.selectedCard.isValidChild(card)){
                            console.log("legal move, moving...");
                            const tableauLocation = game.tableau.indexOf(game.selectedCard);
                            //selected card was in a tableau
                            if (tableauLocation !== -1){
                                const indexInTableauPile = game.tableau.piles[tableauLocation].indexOf(game.selectedCard);
                                game.tableau.piles[this.indexOf(card)] = game.tableau.piles[this.indexOf(card)].concat(game.tableau.piles[tableauLocation].splice(indexInTableauPile,1));
                            } 
                            //selected card was NOT in a tableau
                            else{

                            }
                        } else{
                            console.log("illegal move");
                        }
                    }
                    this.render();
                }));
            }
            $tableauContainer.append($tableau);
        }
        return $tableauContainer;
    }
}

class Foundations {
    constructor(){
        this.piles = [[],[],[],[]];
    }

    render(){
        const $foundationContainer = $(".foundationContainer").length < 1 ? $("<div />").addClass("foundationContainer") : $(".foundationContainer");
        $foundationContainer.empty();
        for(let foundation of this.piles){
            const $foundation = $("<div />").addClass("foundation");
            $foundation.on("click", () => {
                if(game.selectedCard){
                    if (game.selectedCard.suit === foundation[foundation.length - 1].suit){
                        if (values.indexOf(game.selectedCard.value) === values.indexOf(foundation[foundation.length - 1].value + 1)){
                            console.log("valid move to foundation");
                            foundation.push(foundation[foundation.length - 1].pop());
                        } else{
                            console.log("wrong value");
                        }
                    } else{
                        console.log("wrong suit");
                    }
                } else{
                    console.log("no card selected");
                }
            });
            for(let card of foundation){
                $foundation.append(card.render());
            }
            for(let foundationSlot of $foundation){
                const $foundationSlot = $(foundationSlot);
                if($foundationSlot.first()){
                    $foundationSlot.addClass('foundation--empty');
                } else{
                    $foundationSlot.removeClass('foundation--empty');
                }
            }
            $foundationContainer.append($foundation);
        }
        return $foundationContainer;
    }
}

const game = new Game();
game.deck.shuffle();
game.tableau.deal(game.deck);
game.render();