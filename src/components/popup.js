// import React from "react";
import React, { Component } from 'react';
import './Popup.css'
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import classes from './Camera.css';

function Popup(props){
    
    return (props.trigger) ? (
        
        <div className="popup">
        
            <Camera
             onTakePhotoAnimationDone = {props.triggerhandleTakePhotoAnimationDone}
              isFullscreen={true}
            />
        
        </div>
        ) : "";    
}

export default Popup