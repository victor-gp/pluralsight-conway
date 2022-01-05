(function() {

var _ = self.Life = function(seed) {
    this.seed = seed
    this.height = seed.length;
    this.width = seed[0].length;
    this.board = seed
};

_.prototype = {
    toString: function () {
        return this.board.map(row => row.join('')).join("\n");
    }
};

})();

var game = new Life([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
])

console.log(game + '');
