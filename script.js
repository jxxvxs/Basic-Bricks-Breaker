//init
const main_canvas = document.createElement('canvas');
main_canvas.classList.add('canvas');
const ctx = main_canvas.getContext('2d');
document.getElementById('parent').prepend(main_canvas);





//configs
const game = {
    grid: 80
    , ani       : ''
    , bricks    : []
    , num       : 100
    , gameover  : true
    , bonus     : []
};
const ball = {
    x           : game.grid * 7
    , y         : game.grid * 5
    , w         : game.grid / 3
    , h         : game.grid / 3
    , color     : '#999'
    , dx        : 0
    , dy        : 0
};
const player = {
    color       : 'white'
    , speed     : 15
};
const keyz = {
    ArrowLeft   : false
    , ArrowRight: false
};






//controls
main_canvas.setAttribute('width', game.grid * 12);
main_canvas.setAttribute('height', game.grid * 10);
main_canvas.addEventListener('click', (e) => {
    if (game.gameover) {
        game.gameover = false;
        gameStart();
        game.ani = requestAnimationFrame(draw);
    }
    else if (!game.inplay) {
        game.inplay = true;
        ball.dx = 5;
        ball.dy = -5;
    }
})
outputStartGame();
document.addEventListener('keydown', (e) => {
    if (e.code in keyz) {
        keyz[e.code] = true;
    }
    if (e.code == 'ArrowUp' && !game.inplay) {
        game.inplay = true;
        ball.dx = 5;
        ball.dy = -5;
    }
})
document.addEventListener('keyup', (e) => {
    if (e.code in keyz) {
        keyz[e.code] = false;
    }
})
document.addEventListener('mousemove', (e) => {
    const val = e.clientX - main_canvas.offsetLeft;
    if (val > player.w && val < main_canvas.width) {
        player.x = val - player.w;
        if (!game.inplay) {
            ball.x = val - (player.w / 2);
        }
    }
})






//functions
function resetBall() {
    ball.dx     = 0;
    ball.dy     = 0;
    ball.y      = player.y - ball.h;
    ball.x      = player.x + (player.w / 2);
    game.inplay = false;
}

function gameRestart() {
    game.gameover = true;
    game.inplay   = false;
    cancelAnimationFrame(game.ani);
}

function outputStartGame() {
    let output = "Click to Start Game";
    ctx.font   = Math.floor(game.grid * 0.7) + 'px serif';
    if (main_canvas.width < 900) {
        ctx.font = '20px serif';
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(output, main_canvas.width / 2, main_canvas.height / 2);
}

function gameStart() {
    game.inplay     = false;
    player.x        = game.grid * 7;
    player.y        = main_canvas.height - game.grid * 2;
    player.w        = game.grid * 1.5;
    player.h        = game.grid / 4;
    player.lives    = 0;
    player.score    = 0;
    game.bonus      = [];
    resetBall();
    let buffer      = 10;
    let width       = game.grid;
    let height      = game.grid / 2;
    let totalAcross = Math.floor((main_canvas.width - game.grid) / (width + buffer));
    let xPos        = game.grid / 2;
    let yPos        = 0;
    let yy          = 0;
    for (let i = 0; i < game.num; i++) {
        if (i % totalAcross == 0) {
            yy++;
            yPos += height + buffer;
            xPos = game.grid / 2;
        }
        if (yy < 5) {
            createBrick(xPos, yPos, width, height);
        }
        xPos += width + buffer;
    }
}

function createBrick(xPos, yPos, width, height) {
    game.bricks.push({
        x      : xPos
        , y    : yPos
        , w    : width
        , h    : height
        , c    : 'white'
        , v    : Math.floor(Math.random() * 50)
        , bonus: Math.floor(Math.random() * 3)
    });
}

function collDetection(obj1, obj2) {
    const xAxis = (obj1.x < (obj2.x + obj2.w)) && ((obj1.x + obj1.w) > obj2.x);
    const yAxis = (obj1.y < (obj2.y + obj2.h)) && ((obj1.y + obj1.h) > obj2.y);
    const val   = xAxis && yAxis;
    return val;
}

function draw() {
    ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
    onKeyMove();
    ballOnChange();
    drawPlayer();
    drawBall();
    game.bonus.forEach((prize, index) => {
        prize.y += 5;
        drawBonus(prize);
        if (collDetection(prize, player)) {
            player.score += prize.points;
            let temp = game.bonus.splice(index, 1);
        }
        if (prize.y > main_canvas.height) {
            let temp = game.bonus.splice(index, 1);
        }
    })
    game.bricks.forEach((brick, index) => {
        ctx.beginPath();
        ctx.fillStyle   = brick.c;
        ctx.strokeStyle = 'white';
        ctx.rect(brick.x, brick.y, brick.w, brick.h);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        if (collDetection(brick, ball)) {
            let rem = game.bricks.splice(index, 1);
            player.score += brick.v;
            console.log(ball.dy);
            if (ball.dy > -10 && ball.dy < 10) {
                ball.dy--;
            }
            ball.dy *= -1;
            if (brick.bonus == 1) {
                game.bonus.push({
                    x        : brick.x
                    , y      : brick.y
                    , h      : brick.h
                    , w      : brick.w
                    , points : Math.ceil(Math.random() * 100) + 50
                    , color  : 'white'
                    , alt    : '#333'
                    , counter: 10
                })
            }
            if (game.bricks.length == 0) {
                gameRestart();
            }
        }
    })
    if (collDetection(player, ball)) {
        ball.dy *= -1;
        let val1 = ball.x + (ball.w / 2) - player.x;
        let val2 = val1 - player.w / 2;
        let val3 = Math.ceil(val2 / (player.w / 10));
        ball.dx  = val3;
    };
    let output1  = player.lives == 1 ? 'Life Left' : 'Lives Left';
    let output   = `${output1} : ${player.lives} Score : ${player.score}`;
    ctx.font     = Math.floor(game.grid * 0.7) + 'px serif';
    if (game.gameover) {
        ctx.font = '24px serif';
        output   = `Score : ${player.score} | Click to Start Again`;
    }
    if (main_canvas.width < 900) {
        ctx.font = '20px serif';
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.fillText(output, main_canvas.width / 2, main_canvas.height - 20);
    if (!game.gameover) {
        game.ani = requestAnimationFrame(draw);
    }
}

function onKeyMove() {
    if (keyz.ArrowLeft) {
        player.x -= player.speed;
    }
    if (keyz.ArrowRight) {
        player.x += player.speed;
    }
    if (!game.inplay) {
        ball.x = player.x + player.w / 2;
    }
}

function ballOnChange() {
    if (ball.x > main_canvas.width-25 || ball.x < 0) {
        ball.dx *= -1;
    }
    if (ball.y < 0) {
        ball.dy *= -1;
    }
    if (ball.y > main_canvas.height) {
        player.lives--;
        resetBall();
        if (player.lives < 0) {
            gameRestart();
        }
    }
    if (ball.dy > -2 && ball.dy < 0) {
        ball.dy = -3;
    }
    if (ball.dy > 0 && ball.dy < 2) {
        ball.dy = 3;
    }
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function drawBall() {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.rect(ball.x, ball.y, ball.w, ball.h);
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = ball.color;
    let adj = ball.w / 2;
    ctx.arc(ball.x + adj, ball.y + adj, ball.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

function drawBonus(obj) {
    if (obj.counter < 0) {
        if (obj.color == 'black') {
            obj.color = 'white';
            obj.alt = '#333';
            obj.counter = 10;
        }
        else {
            obj.color = 'black';
            obj.alt = 'white';
            obj.counter = 10;
        }
    }
    obj.counter--;
    ctx.beginPath();
    ctx.strokeStyle = obj.color;
    ctx.rect(
        obj.x
        , obj.y
        , obj.w
        , obj.h
        );
    ctx.strokeRect(
        obj.x
        , obj.y
        , obj.w
        , obj.h
        );
    ctx.fillStyle = obj.alt;
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.fillStyle = obj.color;
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText(
        obj.points
        , obj.x + obj.w / 2
        , obj.y + obj.h / 2);
    ctx.closePath();
}

function drawPlayer() {
    ctx.beginPath();
    ctx.rect(
        player.x
        , player.y
        , player.w
        , player.h);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
}
