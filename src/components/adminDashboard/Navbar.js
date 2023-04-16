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
import Axios from 'axios';
import Home from './pages/home'
import Drive from './pages/drive'
import DataForm from './pages/dataForm'
import AddDataForm from './pages/addDataForms';
import AddDrive from './pages/addDrive';
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

export default function AdminNavbar(props) {
  let mode = props.mode
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [home, setHome] = React.useState(false);
  const [drive, setDrive] = React.useState(false);
  const [adddrive, setAddDrive] = React.useState(false);
  const [dataform, setDataform] = React.useState(true);
  const [adddataform, setAddDataform] = React.useState(true);


  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const homezz = () => {
    setHome(true);
    setDrive(false);
    setAddDrive(false);
    setDataform(false);
    setAddDataform(false);
    setOpen(false);
  }
  const drivezz = () => {
    setHome(false);
    setDrive(true);
    setAddDrive(false);
    setDataform(false);
    setAddDataform(false);
    setOpen(false);
  }
  const adddrivezz = () => {
    setHome(false);
    setDrive(false);
    setAddDrive(true);
    setDataform(false);
    setAddDataform(false);
    setOpen(false);
  }
  const dataformzz = () => {
    setHome(false);
    setDrive(false);
    setAddDrive(false);
    setDataform(true);
    setAddDataform(false);
    setOpen(false);
  }
  const adddataformzz = () => {
    setHome(false);
    setDrive(false);
    setAddDrive(false);
    setDataform(false);
    setAddDataform(true);
    setOpen(false);
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
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admin`;
      })
      .catch(error => {
        if (error.response) {
          console.log(error.response.data);
        }
      });
  }
  console.log(mode)
  // if(mode==="drive"){drivezz();}
  // else if(mode==="adddrive"){adddrivezz();}
  // else if(mode==="dataform"){dataformzz();}
  // else if(mode==="adddataform"){adddataformzz();}
  // else{homezz();}


  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar style={{ backgroundColor: "#0c1545" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Dashboard for Admin
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose} >
            <HighlightOffOutlinedIcon />
          </IconButton>
        </div>
        <Divider />
        <Divider />
        <List>
          <ListItem button key={"Home"} onClick={homezz}>
            <ListItemIcon> <PersonIcon /></ListItemIcon>
            <ListItemText primary={"Home"} />
          </ListItem>
          <Divider />
          <ListItem button key={"Drives"} onClick={drivezz}>
            <ListItemIcon> <RoomIcon /></ListItemIcon>
            <ListItemText primary={"Drives"} />
          </ListItem>
          <ListItem button key={"Add Drive"} onClick={adddrivezz}>
            <ListItemIcon> <PlaylistAddOutlinedIcon /></ListItemIcon>
            <ListItemText primary={"Add Drive"} />
          </ListItem>
          <Divider />
          <ListItem button key={"Dataforms"} onClick={dataformzz}>
            <ListItemIcon> <DescriptionOutlinedIcon /></ListItemIcon>
            <ListItemText primary={"Dataforms"} />
          </ListItem>
          <ListItem button key={"Create Dataform"} onClick={adddataformzz}>
            <ListItemIcon> <NoteAddOutlinedIcon /></ListItemIcon>
            <ListItemText primary={"Create Dataform"} />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button key={"Logout"} onClick={logoutme}>
            <ListItemIcon > <ExitToAppIcon /></ListItemIcon>
            <ListItemText primary={"Logout"} />
          </ListItem>
        </List>

      </Drawer>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        {home === true ? <Home /> : drive === true ? <Drive /> : adddrive === true ? <AddDrive /> : dataform === true ? <DataForm /> : adddataform === true ? <AddDataForm /> : null}
      </main>
    </div>
  );
}