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
                    if (aliveNeighbors < 2 || aliveNeighbors > 3)
                        nextBoard[y][x] = 0;
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
    },
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
            800 // ms
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

var lifeView = new LifeView(document.getElementById('grid'), 17, 17);

(function() {

this.buttons = {
    next: $('#button-next'),
    play: $('#checkbox-play'),
    clear: $('#button-clear'),
};

buttons.play.checked = false;

buttons.next.addEventListener('click', function() {
    if (isPlaying()) stopAutoplay();
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
}

lifeView.gridNode.addEventListener('change', function(e) {
    var nodeName = e.target.nodeName.toLowerCase();
    if (nodeName == 'input' && isPlaying()) stopAutoplay();
});

buttons.clear.addEventListener('click', function () {
    if (isPlaying()) stopAutoplay();
    lifeView.clear();
});

})();

// keyboard accessibility
(function() {

lifeView.gridNode.addEventListener('keyup', function(e) {
    if (e.target.nodeName.toLowerCase() != 'input') return;
    var [y, x] = e.target.coords;
    var nextCoord;

    switch(e.key) {
        case 'ArrowLeft':
        case 'Left':
        case 'h':
            nextCoord = [y, x-1];
            break;
        case 'ArrowUp':
        case 'Up':
        case 'k':
            nextCoord = [y-1, x];
            break;
        case 'ArrowRight':
        case 'Right':
        case 'l':
            nextCoord = [y, x + 1];
            break;
        case 'ArrowDown':
        case 'Down':
        case 'j':
            nextCoord = [y + 1, x];
            break;
        default:
            return;
    }

    var [ny, nx] = nextCoord;
    var checkboxes = lifeView.checkboxes;
    if ((checkboxes[ny] || [])[nx]) {
        checkboxes[ny][nx].focus();
    } else {
        // fix case where the focus comes from a mouse click
        checkboxes[y][x].blur();
        checkboxes[y][x].focus();
    }
});

window.addEventListener('keyup', function(e) {
    switch(e.key) {
        case 'n':
            buttons.next.click();
            break;
        case 'p':
            buttons.play.click();
            break;
        case 'c':
            buttons.clear.click();
            break;
    }
});

})();
