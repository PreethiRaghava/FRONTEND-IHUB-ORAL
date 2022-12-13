// import React from "react";
import React, { Component } from 'react';
import './Popup.css'
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import classes from './Camera.css';

function Popup(props){

    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, {type:mime});
    }


    function convertFilewithField(dataUri){
      var file = dataURLtoFile(dataUri, 'filename.png');
      props.triggerhandleTakePhotoAnimationDone(file, props.field_name);
    }
    
    return (props.trigger) ? (
        
        <div className="popup">
        
            <Camera
             onTakePhotoAnimationDone = {convertFilewithField}
              isFullscreen={true}
            />
        
        </div>
        ) : "";    
}

export default Popup