import React from 'react';
import HomeLogo from './icons/healthcare_icon.png'
import { Button } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { makeStyles, Backdrop, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
}));

const styles = {
    height: "95vh",
    background: "#B0F3F2",
    borderRadius: "0px 0px 0px 56px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
    alignItems: "center"
}

const textStyle = {
    color: "#05056B",
    fontFamily: "Montserrat",
    fontSize: "36px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "44px",
    letterSpacing: "0em",
}

function LandingPage() {
    const classes = useStyles();
    const [loading, setLoading] = React.useState(false);
    localStorage.clear();

    const login = () => {
        setLoading(true);
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/login`;
    }
    return (
        <div style={styles}>
            <Button onClick={login}>
                <img src={HomeLogo} />
            </Button><br />
            <label style={textStyle}>IIITH - HCP</label>
            {
                loading ? (
                    <Backdrop className={classes.backdrop} open>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : null
            }
        </div>
    )
}

export default LandingPage;
