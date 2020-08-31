/**
 * Solitaire App
 */

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
}

class Deck{
    constructor(){
        this.cards = [];
        const suits = ["spade", "club", "heart", "diamond"];
        const values = ['Ace',2,3,4,5,6,7,8,9,10,'Jack','Queen','King'];
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
    deal(num){
        return this.cards.splice(0,num);
    }

    render(){
        return $("<div />").addClass("card--back");
    }
}

class Game{
    constructor(){
        this.deck = new Deck();
        //tableau are the piles of cards dealt at the beginning of the game
        this.tableau = new Tableau();
        //foundations are the 4 empty piles that the player builds into throughout the game
        this.foundations = new Foundations();
    }
    tableauDeal(){

    }

    render(){
        const $game = $("<div />").addClass("game");
        $game.append(this.deck.render());
        $game.append(this.tableau.render());
        $game.append(this.foundations.render());
        $("body").append($game);
    }
}

class Tableau {
    constructor(){
        this.piles = [[],[],[],[],[],[],[]];
    }
    deal(deck){
        for (let i = 0; i < this.piles.length; i++){
            this.piles[i] = this.piles[i].concat(deck.deal(i + 1));
        }
    }

    render(){
        const $tableauContainer = $("<div />").addClass("tableauContainer");
        for(let tableau of this.piles){
            const $tableau = $("<div />").addClass("tableau");
            for(let card of tableau){
                $tableau.append(card.render());
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
        const $foundationContainer = $("<div />").addClass("foundationContainer");
        for(let foundation of this.piles){
            const $foundation = $("<div />").addClass("foundation");
            for(let card of foundation){
                $foundation.append(card.render());
            }
            $foundationContainer.append($foundation);
        }
        return $foundationContainer;
    }
}