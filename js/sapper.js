const rows=10;
const cols=10;

let showArray;
let initArray;
let isFinished;

/*window.localStorage.setItem("sound", false);*/

restart();


function restart() {
	isFinished = false;
	let ulContent = "<li></li>".repeat(rows*cols);
	document.getElementById("desk").innerHTML = ulContent;


	initArray=[];

	for(let i=0; i<rows; i++){
		initArray[i]=[];
		for(let j=0; j<cols; j++) {
			initArray[i][j]=false;
			
		}
	}

	let count=0;
	while(count<23){
		let x=Math.floor(Math.random()*10);
		let y=Math.floor(Math.random()*10);
		
		if(!initArray[x][y]){
			initArray[x][y]=true;
			count++;
		}
	}


	console.log(initArray);

	/*showArray=[];

	for(let i=0; i<rows; i++){
		showArray[i]=[];
		for(let j=0; j<cols; j++) {
			showArray[i][j]=-1;
		}
	}
	console.log(showArray);*/
	
}