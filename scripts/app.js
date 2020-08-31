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

    //checks if this card can be moved onto target card
    isValidChild(target){
        const values = ['Ace',2,3,4,5,6,7,8,9,10,'Jack','Queen','King'];
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
        this.tableau = new Tableau(this);
        //foundations are the 4 empty piles that the player builds into throughout the game
        this.foundations = new Foundations();
        this.selectedCard = null;
    }

    render(){
        const $game = $("<div />").addClass("game");
        $game.append(this.deck.render());
        $game.append(this.tableau.render());
        $game.append(this.foundations.render());
        $("body").append($game);
    }

    selectCard(card){
        if(this.selectedCard){
            if(this.selectedCard.isValidChild(card)){
                console.log("move to new location");
                //find the index of the card in the tableau
                const selectionTableauPile = this.tableau.indexOf(card);                
                const targetTableauPile = this.tableau.indexOf(this.selectedCard);

                this.tableau.piles[targetTableauPile].pop();
                this.tableau.piles[selectionTableauPile].push(this.selectedCard);
                this.tableau.render();
            }
            this.selectedCard = null;
        } else{
            this.selectedCard = card;
        }   
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
                    this.game.selectCard(card)
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