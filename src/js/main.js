'use strict'

var Minesweeper = function (element) {
  this.status = 'intializing'
  /* eslint-disable no-multi-spaces */
  this.directions = [[-1, -1], [-1, 0], [-1, 1],
                     [0, -1],          [0, 1],
                     [1, -1], [1, 0], [1, 1]]
  /* eslint-enable no-multi-spaces */
  this.height = 10
  this.width = 10
  this.mines = 15
  this.grid = []
  this.location = document.querySelector(element)
  this.location.addEventListener('mouseup', function (e) {
    if (e.target.id) {
      if (e.which === 1) {
        if (this.status !== 'playing') {
          this.add_mines(this.id_to_pos(e.target.id))
        } else if (this.status === 'playing') {
          this.check(this.id_to_pos(e.target.id), false, true)
        }
        console.log('left click on ' + e.target.id)
      } else if (e.which === 3) {
        if (this.status === 'playing') {
          this.flag(this.id_to_pos(e.target.id))
        }
        console.log('right click on ' + e.target.id)
      }
    }
  }.bind(this))
  this.location.addEventListener('contextmenu', function (e) {
    e.preventDefault()
  })
}

Minesweeper.prototype.init = function () {
  var h, w
  for (h = 0; h < this.height; h++) {
    var row = []
    for (w = 0; w < this.width; w++) {
      var square = new Square()
      row.push(square)
    }
    this.grid.push(row)
  }
  var grid_element = document.createElement('div')
  grid_element.className = 'grid'
  for (h = 0; h < this.height; h++) {
    var row_element = document.createElement('div')
    row_element.className = 'row'
    for (w = 0; w < this.width; w++) {
      var square_element = document.createElement('div')
      square_element.className = 'square'
      square_element.id = 'square[' + h + '][' + w + ']'
      row_element.appendChild(square_element)
    }
    grid_element.appendChild(row_element)
  }
  this.location.appendChild(grid_element)
}

Minesweeper.prototype.add_mines = function (pos) {
  // Find good configuration
  do {
    // Reset all squares
    var neighbors = 0
    var h, w
    for (h = 0; h < this.height; h++) {
      for (w = 0; w < this.width; w++) {
        this.grid[h][w].mine = false
      }
    }
    for (var mine_counter = 0; mine_counter < this.mines; mine_counter++) {
      var mine_placed = false
      while (!mine_placed) {
        var r1 = this.rand(0, this.height - 1)
        var r2 = this.rand(0, this.width - 1)
        if (!this.grid[r1][r2].mine) {
          this.grid[r1][r2].mine = true
          mine_placed = true
        }
      }
    }
    this.directions.forEach(function (e) {
      if (this.check([(parseInt(pos[0], 10) + parseInt(e[0], 10)),
                      (parseInt(pos[1], 10) + parseInt(e[1], 10))], true)) {
        neighbors++
      }
    }.bind(this))
  }
  while (this.grid[pos[0]][pos[1]].mine || neighbors !== 0)
  this.status = 'playing'
  this.check(pos, false)
}

Minesweeper.prototype.check = function (pos, checking, clicked) {
  var y = pos[0]
  var x = pos[1]
  if ((y >= 0) && (y < this.height) &&
      (x >= 0) && (x < this.width)) {
    var cur = this.grid[pos[0]][pos[1]]
    if ((clicked && !cur.flag &&
      !cur.question &&
      !cur.activated) || (!clicked && !cur.activated)) {
      if (cur.mine) {
        if (!checking) {
          this.pos_to_element(pos).classList.add('mine')
          // window.alert('You lost!')
        } else {
          return true
        }
      } else if (!checking) {
        var neighbors = 0
        this.directions.forEach(function (e) {
          if (this.check([(parseInt(y, 10) + parseInt(e[0], 10)),
                          (parseInt(x, 10) + parseInt(e[1], 10))], true)) {
            neighbors++
          }
        }.bind(this))
        if (neighbors === 0) {
          this.pos_to_element(pos).classList.add('activated')
          this.grid[y][x].activated = true
          this.directions.forEach(function (e) {
            (this.check([(parseInt(y, 10) + parseInt(e[0], 10)),
                        (parseInt(x, 10) + parseInt(e[1], 10))], false))
          }.bind(this))
        } else {
          this.pos_to_element(pos).innerHTML = neighbors
          this.pos_to_element(pos).classList.add('activated')
          this.grid[y][x].activated = true
        }
        // console.log('[' + y + '][' + x + '] has neighbors: ' + neighbors)
      } else if (checking) {
        return false
      }
    }
  }
  this.check_win_state()
}

Minesweeper.prototype.flag = function (pos) {
  var cur = this.grid[pos[0]][pos[1]]
  if (!cur.activated) {
    if (!cur.flag && !cur.question) {
      cur.flag = true
      this.pos_to_element(pos).classList.add('flag')
    } else if (cur.flag && !cur.question) {
      cur.flag = false
      cur.question = true
      this.pos_to_element(pos).classList.remove('flag')
      this.pos_to_element(pos).classList.add('question')
    } else if (!cur.flag && cur.question) {
      cur.question = false
      this.pos_to_element(pos).classList.remove('question')
    }
  }
  this.check_win_state()
}

Minesweeper.prototype.check_win_state = function () {
  var h, w
  var all_non_mine_squares_activated = false
  var all_flags_set = false
  var activated_squares = 0
  var flags_correctly_marked = 0

  for (h = 0; h < this.height; h++) {
    for (w = 0; w < this.width; w++) {
      var cur = this.grid[h][w]
      if (cur.activated) {
        activated_squares++
      }
      if (cur.flag && cur.mine) {
        flags_correctly_marked++
      }
    }
  }

  if (activated_squares === (this.height * this.width) - this.mines) {
    all_non_mine_squares_activated = true
  }
  if (flags_correctly_marked === this.mines) {
    all_flags_set = true
  }

  if (all_non_mine_squares_activated || all_flags_set) {
    window.alert('Congradtlations! You won!')
  }
}

Minesweeper.prototype.id_to_pos = function (id) {
  var id_matches = id.match(/(\w+)\[(\d+)\]\[(\d+)\]/)
  return [id_matches[2], id_matches[3]]
}

Minesweeper.prototype.pos_to_element = function (pos) {
  return document.getElementById('square[' + pos[0] + '][' + pos[1] + ']')
}
// Minesweeper.prototype.grid_to_id = function (y, x, key, value) {
//   document.getElementById('square[' + y + '][' + x + ']')[key] = value
// }

Minesweeper.prototype.rand = function (min, max, round) {
  if (round === false) {
    return (Math.random() * (max - min)) + min
  } else {
    return Math.round((Math.random() * (max - min)) + min)
  }
}

var Square = function () {
  this.activated = false
  this.mine = false
  this.flag = false
  this.question = false
}

var Game = new Minesweeper('#board')
Game.init()
