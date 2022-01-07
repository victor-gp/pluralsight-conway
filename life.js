function $(selector, container) {
    return (container || document).querySelector(selector);
}

(function() {

var _ = self.Life = function(seed) {
    this.seed = seed;
    this.height = seed.length;
    this.width = seed[0].length;
    this.board = clone2dArray(seed);
};

_.prototype = {
    toString: function () {
        return this.board
            .map(row => row.join(''))
            .join("\n");
    },

    next: function () {
        var nextBoard = clone2dArray(this.board);
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var alive = !!this.board[y][x];
                var aliveNeighbors = this.aliveNeighbors(y, x);
                if (alive) {
                    if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                        nextBoard[y][x] = 0;
                    }
                } else if (aliveNeighbors == 3) {
                    nextBoard[y][x] = 1;
                }
            }
        }
        this.board = nextBoard;
    },

    aliveNeighbors: function(y, x) {
        var wba = this.withinBoundsAndAlive.bind(this); // func alias with access to this
        var neighborsLife = [
            wba(y-1, x-1), wba(y-1, x), wba(y-1, x+1),
            wba(y, x-1), wba(y, x+1),
            wba(y+1, x-1), wba(y+1, x), wba(y+1, x+1),
        ];
        var sum = neighborsLife.reduce((a, b) => a + b);
        return sum;
    },

    withinBoundsAndAlive: function(y, x) {
        if (y < 0 || y >= this.height || x < 0 || x >= this.width) {
            return 0;
        } else {
            return this.board[y][x];
        }
    }
};

function clone2dArray(array) {
    return array.slice().map(row => row.slice())
}

})();

var game = new Life([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    // [1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
]);

console.log(game + '');
game.next();
console.log(game + '');
game.next();
console.log(game + '');

(function() {

var _ = self.LifeView = function(gridElement, height, width) {
    this.gridElem = gridElement; // must be a <table>
    this.height = height;
    this.width = width;
    this.createGrid();
};

_.prototype = {
    createGrid: function() {
        var fragment = document.createDocumentFragment();
        for (var y = 0; y < this.height; y++) {
            var row = document.createElement('tr');
            fragment.appendChild(row);

            for (var x = 0; x < this.width; x++) {
                var cell = document.createElement('td');
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                cell.appendChild(checkbox);
                row.appendChild(cell);
            }
        }
        this.gridElem.innerHTML = ''; // just in case
        this.gridElem.appendChild(fragment);
    },

    next: function() {

    },
}

})();

var lifeView = new LifeView(document.getElementById('grid'), 16, 16);

(function() {

$('#button-next').addEventListener('click', function() {
    lifeView.next();
})

})();
