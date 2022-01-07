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

(function() {

var _ = self.LifeView = function(gridElement, height, width) {
    this.gridNode = gridElement; // must be a <table>
    this.height = height;
    this.width = width;
    this.createGrid();
};

_.prototype = {
    createGrid: function() {
        this.gridNode.innerHTML = ''; // just in case
        var fragment = document.createDocumentFragment();
        this.checkboxes = [];
        for (var y = 0; y < this.height; y++) {
            var row = document.createElement('tr');
            fragment.appendChild(row);
            this.checkboxes[y] = []

            for (var x = 0; x < this.width; x++) {
                var cell = document.createElement('td');
                row.appendChild(cell);
                var checkbox = document.createElement('input');
                cell.appendChild(checkbox);
                this.checkboxes[y][x] = checkbox;
                checkbox.type = 'checkbox';
                checkbox.coords = [y, x];
            }
        }

        // for testing
        this.checkboxes[1][0].checked = true;
        this.checkboxes[1][1].checked = true;
        this.checkboxes[1][2].checked = true;

        this.gridNode.appendChild(fragment);
    },

    next: function() {
        model = new Life(this.boardArray);
        model.next();
        board = model.board;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.checkboxes[y][x].checked = !!board[y][x];
            }
        }
    },

    get boardArray() {
        return this.checkboxes.map(row => row.map(cb => +cb.checked));
    },

    autoplay: function() {
        this.next();
        var me = this;
        this.timeToNextPlay = setTimeout(
            function() { me.autoplay(); },
            1000 // ms
        );
    },

    stopAutoplay: function() {
        clearTimeout(this.timeToNextPlay);
    },

    clear: function() {
        this.checkboxes.forEach(
            row => row.forEach(
                checkbox => checkbox.checked = false
            )
        );
    },
}

})();

var lifeView = new LifeView(document.getElementById('grid'), 16, 16);

(function() {

var buttons = {
    next: $('#button-next'),
    play: $('#checkbox-play'),
    clear: $('#button-clear'),
}

buttons.play.checked = false;

buttons.next.addEventListener('click', function() {
    if (isPlaying()) {
        stopAutoplay();
    }
    lifeView.next();
});

buttons.play.addEventListener('change', function () {
    if (this.checked) {
        buttons.next.disabled = true;
        lifeView.autoplay();
    } else {
        stopAutoplay();
    }
});

function isPlaying() {
    return buttons.play.checked;
}

function stopAutoplay() {
    lifeView.stopAutoplay();
    buttons.play.checked = false;
    buttons.next.disabled = false;
};

lifeView.gridNode.addEventListener('change', function(event) {
    var nodeName = event.target.nodeName.toLowerCase();
    if (nodeName == "input" && isPlaying()) {
        stopAutoplay();
    }
});

buttons.clear.addEventListener('click', function () {
    if (isPlaying()) {
        stopAutoplay();
    }
    lifeView.clear();
});

})();
