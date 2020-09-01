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
        $card.append($("<div />").addClass(`card__suit--${this.suit}`).addClass("card__suit"));
        $card.append($("<div />").text(this.value).addClass("card__value"))
        if(!this.faceUp){
            $card.addClass("card--face-down");
        }
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
        this.drawPile[this.drawPile.length - 1].faceUp = true;
        game.render();
    }

    deal(num){
        if(this.cards.length === 0){
            this.cards.push(...this.drawPile.reverse());
            this.drawPile = [];
        }
        return this.cards.splice(this.cards.length - num,num);
    }

    render(){
        const $deckAndDraw = $(".deck-and-draw").length > 0 ? $(".deck-and-draw") : $("<div />").addClass("deck-and-draw");
        $deckAndDraw.empty();
        const $deck = ($("<div />").addClass("deck"));
        const $drawPile = ($("<div />").addClass("drawPile"));
        if(this.drawPile[0]){
            $drawPile.append(this.drawPile[this.drawPile.length - 1].render());
            $drawPile.on("click", () => {
                if (!game.selectedCard){
                    game.selectedCard = this.drawPile[this.drawPile.length - 1];
                } else{
                    game.selectedCard = null;
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
        for(let i = 0; i < this.piles.length; i++){
            this.piles[i][this.piles[i].length - 1].faceUp = true;
        }
    }

    //returns the index of the tableau that the specified card is in, or -1 if the card is not found
    indexOf(card){
        for (let i = 0; i < this.piles.length; i++){
            if (this.piles[i].indexOf(card) !== -1){
                console.log("found card in pile " + i)
                return i;
            }
        }
        console.log("did not find card");
        return -1;
    }

    render(){
        const $tableauContainer = $(".tableauContainer").length < 1 ? $("<div />").addClass("tableauContainer") : $(".tableauContainer");
        $tableauContainer.empty();
        for(let tableau of this.piles){
            const $tableau = $("<div />").addClass("tableau");
            $tableau.on("click", () => {
                console.log("caled")
                console.log(tableau);
                if (tableau.length === 0 && game.selectedCard.value === "K"){
                    console.log("entered");
                    const tableauLocation = game.tableau.indexOf(game.selectedCard);
                    //selected card was in a tableau
                    if (tableauLocation !== -1){
                        const indexInTableauPile = game.tableau.piles[tableauLocation].indexOf(game.selectedCard);
                        tableau.push(...game.tableau.piles[tableauLocation].splice(indexInTableauPile));
                    } 
                    //selected card was The top card of the draw pile
                    else if (game.selectedCard === game.deck.drawPile[game.deck.drawPile.length - 1]){
                        console.log("moving from draw pile to tableau");
                        tableau.push(game.deck.drawPile.pop());
                    } else{
                        console.log("not sure where selected card came from");
                    }
                    game.render();
                }
            });
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
                                tableau.push(...game.tableau.piles[tableauLocation].splice(indexInTableauPile));
                            } 
                            //selected card was The top card of the draw pile
                            else if (game.selectedCard === game.deck.drawPile[game.deck.drawPile.length - 1]){
                                console.log("moving from draw pile to tableau");
                                game.tableau.piles[game.tableau.indexOf(card)].push(game.deck.drawPile.pop());
                            } else{
                                console.log("not sure where selected card came from");
                            }
                        } else{
                            console.log("illegal move");
                        }
                        game.selectedCard = null;
                    }
                    this.checkForEmptyPiles();
                    game.render();
                }));
            }
            $tableauContainer.append($tableau);
        }
        return $tableauContainer;
    }

    //goes thru tableau and flips bottom cards of empty stacks
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
            if (pile.length === 13){
                return true;
            } else {
                return false
            }
        }
    }

    render(){
        const $foundationContainer = $(".foundationContainer").length < 1 ? $("<div />").addClass("foundationContainer") : $(".foundationContainer");
        $foundationContainer.empty();
        for(let foundation of this.piles){
            const $foundation = $("<div />").addClass("foundation");
            $foundation.on("click", () => {
                console.log("foundation clicked");
                if(game.selectedCard){
                    //put ace into empty pile
                    if (foundation.length === 0){
                        if( game.selectedCard.value === "A"){
                        console.log("empty foundation")
                        const tableauLocation = game.tableau.indexOf(game.selectedCard);
                            //selected card was in a tableau
                            if (tableauLocation !== -1){
                                const indexInTableauPile = game.tableau.piles[tableauLocation].indexOf(game.selectedCard);
                                foundation.push(game.tableau.piles[tableauLocation].pop());
                            } 
                            //selected card was The top card of the draw pile
                            else if (game.selectedCard === game.deck.drawPile[game.deck.drawPile.length - 1]){
                                console.log("moving from draw pile to tableau");
                                foundation.push(game.deck.drawPile.pop());
                            } else{
                                console.log("not sure where selected card came from");
                            }
                        } else{
                            console.log("foundaiton empty but not ace chosen");
                        }
                    } else if((foundation[0].suit === game.selectedCard.suit && values.indexOf(game.selectedCard.value) === values.indexOf(foundation[foundation.length - 1].value) + 1)){
                        const tableauLocation = game.tableau.indexOf(game.selectedCard);
                        //selected card was in a tableau
                        if (tableauLocation !== -1){
                            const indexInTableauPile = game.tableau.piles[tableauLocation].indexOf(game.selectedCard);
                            foundation.push(game.tableau.piles[tableauLocation].pop());
                        } 
                        //selected card was The top card of the draw pile
                        else if (game.selectedCard === game.deck.drawPile[game.deck.drawPile.length - 1]){
                            console.log("moving from draw pile to tableau");
                            foundation.push(game.deck.drawPile.pop());
                        } else{
                            console.log("not sure where selected card came from");
                        }
                    } else{
                        console.log("move not legal")
                    }
                game.tableau.checkForEmptyPiles();
                game.selectedCard = null;
                game.render();
            }});
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

const game = new Game();
//game.deck.shuffle();
game.deck.cards.reverse();
game.tableau.deal(game.deck);
game.render();



