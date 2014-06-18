/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitary (min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get an URL parameter
 */
function getURLParameter(name: string): string {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

/**
 * Shuffle an array. The argument array will be modified.
 */
function shuffle(array : any[]) {
    var currentIndex = array.length
        , temporaryValue
        , randomIndex
    ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Get a random element from an array
 */
function getRandomElement(myArray: any) {
    return myArray[Math.floor(Math.random() * myArray.length)];
}

/**
 * Remove an element with the supplied index from an array.
 */
function removeElementAtIndex(array: any, index: number): void {
    array.splice(index, 1);
}