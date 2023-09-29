let grid = document.querySelectorAll("#game-grid .cell"); // linear array of the 81 cells 
let buttons = document.querySelectorAll("#button-pad .cell");  // buttons with the numbers we can put 
let erase_btn = document.getElementById("erase-button");  // erase button 
let restart_btn = document.getElementById("restart-button"); // restart button
let streak_counter = document.getElementById("streak");  // streak counter element 
let diff_btn = document.getElementById("diff-level"); // hint button 
 
let success_sound = document.getElementById("success"); 
let wrong_sound =  document.getElementById("error");   
success_sound.volume = 0.4; 
wrong_sound.volume = 0.7; 

let base_solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7], 
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];     

// variables for the game and events : 
let hidden = [];  // hidden cells for the current grid configuration, this resets when we generate another solution by asign to it another value 
let streak = 0; 
let correct_counter = 0; // counts the number of correct numbers we got so far, decreases when we delete something we put 
let selected = 0; // holds the number cliked on 
let erase_mode = false; // flag 
let shaded_number = "";  // holds the number that is currently being highlighted / shaded 
let difficulty_level = 1; 

// general purpose functions 
function getRandom(start, end) { // no se incluye el final 
    let rand_n = Math.floor(Math.random() * 100000); // big random number  
    return (rand_n % (end - start)) + start; // formula 
}

function belongs(x, arr) { // determine if a number belongs in a set 
    for(let i = 0; i < arr.length; i++) {
        if(x == arr[i]) 
            return true; 
    }
    return false; 
}

// we change the ocurrences of a certain number with the other one, this creates
// a random like shuffle of the whole grid 
function shuffle() { 
    let a = getRandom(1, 10); 
    let b = getRandom(1, 10); 
    for(let i = 0; i < base_solution.length; i++) {
        for(let j = 0; j < base_solution[i].length; j++) {
            if(base_solution[i][j] == a) {
                base_solution[i][j] = b; 
            } else if(base_solution[i][j] == b) {
                base_solution[i][j] = a;
            }
        }
    }
}

// in this function we basically do shuffles to the internal array with the 
// solution and then write all of it to the html grid  and generate new hidden cells as well, and for that choose what to show this time 

function generate_solution() {  
    for(let m = 0; m < 81; m++) { // reset the grid; basic configuration  
        grid[m].textContent = ''; 
        grid[m].style.color = "black"; 
        grid[m].style.backgroundColor = "#DDE";
    } 
    let temp_hidden = [];  
    for(let i = 0; i < 5; i++)  // In my opinion, 5 is enough to create a "new game"
        shuffle();

    let n; 
    switch (difficulty_level) { // is going to change for each restart based on the difficulty selected
        case 1:
            n = 20; 
            break;
        case 2:
            n = 50; 
            break;
        case 3:
            n = 70; 
            break;
    }
    for(let i = 0; i < n; i++)
        temp_hidden.push(getRandom(0, 81)); 

    let u_hidden = []; // filter for unique indexes, this wont mess up the correct counter 
    for(let i = 0; i < temp_hidden.length; i++) {
        if(!belongs(temp_hidden[i], u_hidden)) 
            u_hidden.push(temp_hidden[i]); 
    } 
    for(let m = 0, k = 0; m < 9; m++) {
        for(let q = 0; q < 9; q++, k++) {
            if(!belongs(k, u_hidden)) { // if is not a hidden cell (hidden index) then it can be set to the html grid 
                grid[k].textContent = base_solution[m][q]; 
            }
        }
    }
    hidden = u_hidden; // trust me bro 
}
generate_solution();  // for the reload 

//* EVENTS -------------------------------------------------- 

restart_btn.addEventListener('click' , function (){   // reset some stuff 
    correct_counter = 0; 
    generate_solution(); // modifica el arreglo interno y lo graba al tablero html , junto con nuevas celdas escondidas
}); 

erase_btn.addEventListener('click', function() {
    erase_mode = true; 
}); 

diff_btn.addEventListener('click', function(){
    if(difficulty_level < 3) {
        diff_btn.textContent = "Nivel: "+ (++difficulty_level);
    } else {
        diff_btn.textContent = "Nivel: 1";
        difficulty_level = 1; 
    }
    restart_btn.click(); 
}); 

for(let x = 0; x < buttons.length; x++) {
    buttons[x].addEventListener('click', function(){
        selected = parseInt(buttons[x].textContent);
    }); 
}

for(let i = 0; i < grid.length; i++) { // event for the cells 
    grid[i].addEventListener('click', function(e){
        
        // there is no overwrite option to something we put 
        if(selected != 0 && (grid[i].textContent == '')) { // si esta disponible y se ha seleccionado algo 
            grid[i].textContent = selected; // before so that when we win, the writen cell gets to ''
            
            if(selected == base_solution[Math.floor(i / 9)][i % 9]) {
                grid[i].style.color="green";   
                correct_counter++; 
                success_sound.play();
                if(correct_counter == hidden.length) { // +1 win 
                    streak_counter.textContent = "Streak: " + (++streak);
                    correct_counter = 0;  // we should call restart right? i dont know how rn 
                    generate_solution();
                } 
            } else {
                grid[i].style.color="red";   
                wrong_sound.play();     
            } 
            selected = 0; // so that we need to press again to put a number ; deselect 

        } else if(erase_mode == true && belongs(i, hidden)) { // solo se pueden borrar los ocultos 
            grid[i].textContent = ''; 
            erase_mode = false; 
            grid[i].style.backgroundColor = "#DDE"; // in case it was highlighted 
            
            if(grid[i].style.color=="green") // if we erase something right we decrement 
                correct_counter--; 

        } else { // asume that we only click on number of the grid to see its ocurrences 
            for(let k = 0; k < grid.length; k++) { // reset if there was highlighted number already 
                for(let t = 0; t < 9; t++) {
                    if(grid[k].textContent == shaded_number)  
                        grid[k].style.backgroundColor="inherit"; 
                }
            }
            // apply highlight to the new selected number 
            if(grid[i].textContent != '') {
                for(let k = 0; k < grid.length; k++) {
                    for(let t = 0; t < 9; t++) {
                        if(grid[k].textContent == grid[i].textContent) {  
                            grid[k].style.backgroundColor="#888"; 
                        }
                    }
                }
                shaded_number = grid[i].textContent; 
            }
        }
    }); 
}
