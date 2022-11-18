import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import PlaylistAddOutlinedIcon from '@material-ui/icons/PlaylistAddOutlined';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import RoomIcon from '@material-ui/icons/Room';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Axios from 'axios';
import DriveInfo from './driveinfo';
import Grid from '@material-ui/core/Grid';
import HealthcareIcon from '../../icons/healthcare_icon.png'
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function AdminDriveInfo(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  let org_name = localStorage.getItem("iiith-hcp-org_name") || "Admin Dashboard"
  let org_logo = localStorage.getItem("iiith-hcp-org_logo") || null
  let user_login = localStorage.getItem("iiith-hcp-user_login") || "Anonymous"
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const homezz = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/home`;
  }
  const drivezz = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/drives`;
  }
  const back = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/drives`;
  }
  const adddrivezz = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/adddrive`;
  }
  const dataformzz = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/dataforms`;
  }
  const adddataformzz = () =>{
    window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/createdataform`;
  }
  const logoutme = () => {
    Axios({
      method: "POST",
      url: "/admin/logout",
      withCredentials: true
    })
    .then(res => {
      console.log(`response is: ${res.data}`);
      console.log(`status is :${res.status}`);
      localStorage.removeItem("app_drive_id");
      localStorage.removeItem("iiith-hcp-org_name");
      localStorage.removeItem("iiith-hcp-org_logo");
      localStorage.removeItem("iiith-hcp-user_login");
      window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
    })
    .catch(error => {
      if (error.response){
        console.log(error.response.data);
      }
    });
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar style={{backgroundColor:"#B0F3F2"}}>
          <IconButton
            color="primary"
            aria-label="open drawer"
            onClick={back}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <ArrowBackIcon />
          </IconButton>
          <div style={{paddingTop:"0.5%",paddingBottom:"0.5%",width:"100%"}}>
            <Grid container  spacing={2}>
              <Grid item xs={8}>
                <Typography align="left" variant="h5" noWrap style={{color:"#05056B"}}>
                <img style={{width:"50px",height:"50px",marginRight:"1%"}} src={HealthcareIcon}/>
                  <b>IIITH-HCP</b>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography align="right" variant="h5" noWrap style={{color:"#05056B"}}>
                  <b>{org_name}</b>
                <img style={{width:"50px",height:"50px",marginLeft:"1%",alignContent:"right"}} src={org_logo}/>
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <DriveInfo/>
      </main>
    </div>
  );
}