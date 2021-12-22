import React from 'react';
import zxcvbn from 'zxcvbn';

const PasswordStrengthMeter = ({ password }) =>{

const textResult = zxcvbn(password);
let num  = textResult.score * 100/4;
if(password !=="" && num === 0){
    num = 10;
}

const createPassLabel = () =>{
    switch(textResult.score){
        case 0:
            return 'Very weak';
        case 1:
            return 'Weak';
        case 2:
            return 'Fair'; 
        case 3:
            return 'Good';
        case 4:
            return 'Strong';  
        default:
            return '';     
    }
}

const funcProgressColor = () =>{
    switch(textResult.score){
        case 0:
            return '#363632';
        case 1:
            return '#ff1a1a';    
        case 2:
            return '#ff9933'; 
        case 3:
            return '#bfff00';           
        case 4:
            return '#009933';  
        default:
            return 'none';     
    }
}

const changePasswordColor = () =>({
    width:`${num}%`,
    background: funcProgressColor(),
    height: '7px'
})


return(
    <>
    <div className = "progress" style={{height:'7px'}}>
        <div className="progress-bar" style={changePasswordColor()}></div>
    </div>
    <p className="text-left" style={{color: funcProgressColor()}}>{createPassLabel()}</p>
    </>
  )
}

export default PasswordStrengthMeter