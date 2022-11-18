import React from 'react'
import {AppBar, Button, Typography,Toolbar} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import HealthcareIcon from './icons/healthcare_icon.png'

const useStyles = makeStyles((theme) => ({
    navbar: {
      backgroundColor: "#FFFCFC",
      boxShadow: "0px 3px 5px rgba(163, 161, 161, 0.25)"
    },
    appName: {
      flexGrow: 1,
      textAlign:"left",      
      color:"#868686",
      fontSize:"0.8rem"
    },
    orgName: {
      textAlign:"right",
      color:"#868686",
      fontSize:"0.8rem",
      //maxWidth:"initial"
    },
    toolbar: {
        //minHeight: "auto",
        //height:"75px",
        paddingTop: "15px",
        paddingBottom: "15px"
    },
    appLogo: {
        width: "50px",
        height: "50px",
        marginRight: "5px"
    },
    orgLogo:{
        width: "50px",
        height: "50px",
        textAlign:"right",
        marginLeft: "15px"
    }
}));


function Navbar() {
    const classes = useStyles();
    const orgName = localStorage.getItem("assist_org_name") ? localStorage.getItem("assist_org_name").toUpperCase() : "";
    const orgLogo = localStorage.getItem("assist_org_logo")    
    return (
        <AppBar position="static" className={classes.navbar}>
            <Toolbar classes={{regular: classes.toolbar}}>
                <img src={HealthcareIcon} className={classes.appLogo}/>
                <Typography variant="h6" className={classes.appName}>IIITH-HCP</Typography>
                <Typography variant="h6" className={classes.orgName}>{orgName}</Typography>
                { orgLogo ? <img src={orgLogo} className={classes.orgLogo}/> : null }
            </Toolbar>            
        </AppBar>
    )
}

export default Navbar;

