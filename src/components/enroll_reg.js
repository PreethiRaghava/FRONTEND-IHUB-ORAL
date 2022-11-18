import React, { Component } from 'react'
import Axios from 'axios';
import HomeLogo from './icons/healthcare_icon.png';
import BackArrow from './icons/backArrow.png'
import RegisterIcon from './icons/register.png'
import Screening from './icons/screening.png'
import StationIcon from './icons/station.png'
import './enrollReg.css';
import Navbar from './navbar';
import {Select,FormControl,InputLabel,MenuItem,
        Backdrop,CircularProgress,
        Modal,Container
    } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import * as FiIcons from 'react-icons/fi';


const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    selectDrives: {
        background: "#05056B !important",
        borderRadius: "32px !important",
        color: "#FEFEFF",
        minWidth: "150px",
        fontWeight:"500",
        paddingLeft:"10px"
    },
    selectDriveMenu : {
        marginTop: "5px",
        color: "#05056B",
        background: "#FFFEFE",
        borderRadius: "8px"
    },
    icon: {
        fill: "white",
    },
    paper: {
        position: 'absolute',
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
      },
      formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
        display: "block"
    },
    selectCategory: {
        background: "#10DDCD",
        borderRadius: "32px",
        "& .MuiSelect-selectMenu": {
            color: "#05056B",
            fontWeight:"600",
            paddingLeft:"10px"
        },
        "&&&:before": {
            borderBottom: "none"
        },
        "&&:after": {
            borderBottom: "none"
        },
        '& .MuiSelect-select:focus':{
            backgroundColor:'unset'
        }
    },
    selectCategoryMenu : {
        marginTop: "5px"
    },
})

class EnrollReg extends Component {
    constructor(props){
        super(props);
        this.state={
            // mobile_number: props.location.state ? props.location.state.mobile_number : "",
            mobile_number: localStorage.getItem("assist_mobile_number"),
            drives: [],
            driveSelectedName: "",
            driveSelected: "",
            loading:false,
            modalOpen: false,
            categoryList: [],
            selectCategory: ''
        }

    }

    async componentDidMount(){
        // FETCH DRIVES OF THIS ASSISTANT
        this.setState({loading:true})
        let driveList = []
        await Axios({
            method: "POST",
            url: "/drive/allbyassistmobile",
            data: {
                mobile: this.state.mobile_number,
            },
            withCredentials: true
        })
        .then(res => {
            driveList = res.data.data
        })
        .catch(error => {
            this.setState({loading:false})
            if (error.response){
                console.log(error.response.data.msg);
            }
        });

        // FETCH ORG OF THIS ASSISTANT
        await Axios({
            method: "POST",
            url: "/organisation/orgbyassistmobile",
            data: {
                mobile_number: this.state.mobile_number,
            },
            withCredentials: true
        })
        .then(res => {
            localStorage.setItem("assist_org_name",res.data.data.orgname);
            localStorage.setItem("assist_org_logo",res.data.data.orglogo);
            this.setState({
                loading: false,
                drives: driveList
            })
        })
        .catch(error => {
            this.setState({loading:false})
            if (error.response){
                console.log(error.response.data.msg);
            }
        });
    }

    modalOpen = () => {
        this.setState({
            modalOpen:true
        })
    }

    modalClose = () => {
        this.setState({
            modalOpen:false
        })
    }

    changeCategory = e => {
        this.setState({
            selectCategory: e.target.value,
            loading: true
        })
        localStorage.setItem("station_category",e.target.value);
        this.modalClose();
        window.location = `${process.env.REACT_APP_URL_PREFIX}/stationform`;
    }

    driveSet = e => {
        var driveName = e.target.value.split(';')[0]
        var driveId = e.target.value.split(';')[1]
        localStorage.setItem("drive_selected" , driveId);
        localStorage.setItem("drive_selected_name" , driveName);

        this.setState({
            loading:true,
            driveSelectedName: driveName,
            driveSelected: driveId
        })
        Axios({
            method: "POST",
            url: "/assist/renderbymob",
            data: {
                driveID: driveId,
                mobile: this.state.mobile_number
            },
            withCredentials: true
        })
        .then(res => {
            this.setState({loading: false});
            console.log(res.data)
            let categoryList = []
            for(var category in res.data.data){
                categoryList.push(category)
            }
            this.setState({categoryList: categoryList})
            })
        .catch(error => {
            this.setState({loading: false});
            if (error.response){
                console.log(error.response.data.msg);
            }
        });
    }

    register = () => {
        this.setState({loading:true});
        window.location = `${process.env.REACT_APP_URL_PREFIX}/register`;
    }

    enroll = () => {
        this.setState({loading:true});
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enroll`;
    }

    logout = e => {
        this.setState({loading:true})
        e.preventDefault();
        Axios({
            method: "POST",
            url: "/assist/logout",
            withCredentials: true
        })
        .then(res => {
            localStorage.removeItem("drive_selected");
            localStorage.removeItem("drive_selected_name");
            localStorage.removeItem("assist_org_name");
            localStorage.removeItem("assist_mobile_number");
            localStorage.removeItem("assist_org_logo");
            window.location = `${process.env.REACT_APP_URL_PREFIX}/login`;
        })
        .catch(error => {
            this.setState({loading:false})
            if (error.response){
                console.log(error.response.data.msg);
            }
        });
    }

    render() {
        const {classes} = this.props;
        return (
        <div className="homeStyle">
            <Navbar />

            <div className="container" style={{marginTop:"40px"}}>
                <div className="row justify-content-start">
                    <div className="col-2">
                        <button className="enrollRegBackSet" onClick={this.logout}>
                            <img src={BackArrow}/>
                            <label id="enrollRegBack" style={{color:"#05056B",marginLeft:"15px"}} className="labelStyle">Back</label>
                        </button>
                    </div>
                    <div className="col-8">
                        <img className="logoStyle" src={HomeLogo} />
                    </div>
                </div>
            </div>
            <br></br>
            <FormControl>
                <Select
                onChange={e => this.driveSet(e)}
                displayEmpty
                value={`${this.state.driveSelectedName};${this.state.driveSelected}`}
                classes={{
                    select: classes.selectDrives,
                }}
                inputProps={{
                    classes: {
                        icon: classes.icon,
                    },
                }}
                disableUnderline
                MenuProps={{
                    getContentAnchorEl: null,
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "center",
                    },
                    classes: {paper: classes.selectDriveMenu},
                    transformOrigin: { horizontal: 'center', vertical: 'top'}
                }}
                >
                    <MenuItem value=";" disabled>Select Drive</MenuItem>
                {
                    this.state.drives.map(drive => {
                            return <MenuItem key={drive._id} value={`${drive.drive_name};${drive._id}`}>{drive.drive_name.replace(/_/g, ' ').toUpperCase()}</MenuItem>
                    })
                }
                </Select>
            </FormControl>
            <br></br>
            <Container maxWidth="xl" >
                <div className="container">
                    <div className="row">
                        <div className="col-sm-4">
                                <button disabled={this.state.driveSelected === ""} className="enrollRegButton" onClick={this.register} >
                                <img style ={{borderRadius:"22px"}} src={RegisterIcon}/>
                                </button>
                                <p style={{color: !this.state.driveSelected ? "#D2D2D2" : "#05056B"}} className="labelStyle">Patient Registration</p>
                        </div>
                        <div className="col-sm-4">
                                <button disabled={this.state.driveSelected === ""} className="enrollRegButton" onClick={this.enroll}>
                                <img style ={{borderRadius:"22px"}} src={Screening} />
                                </button>
                                <p style={{color: !this.state.driveSelected ? "#D2D2D2" : "#05056B"}} className="labelStyle">Patient Screening</p>
                        </div>
                        <div className="col-sm-4">
                                <button disabled={this.state.driveSelected === ""} className="enrollRegButton" onClick={this.modalOpen}>
                                <img style ={{borderRadius:"22px"}} src={StationIcon}/>
                                </button>
                                <p style={{color: !this.state.driveSelected ? "#D2D2D2" : "#05056B"}} className="labelStyle">Set Station</p>
                        </div>
                    </div>
                </div>
            </Container>

            <Modal
                    open={this.state.modalOpen}
                    onClose={this.modalClose}
                >
                    <div id="stationSetModal">
                        <label className="labelStyle">Select your station</label>
                        <FormControl className={classes.formControl}>
                                <Select
                                    onChange={this.changeCategory}
                                    displayEmpty
                                    value={this.state.selectCategory}
                                    className ={classes.selectCategory}
                                    MenuProps={{
                                        getContentAnchorEl: null,
                                        anchorOrigin: {
                                            vertical: "bottom",
                                            horizontal: "center",
                                        },
                                        PaperProps: {
                                            style: {
                                                maxHeight: 48 * 8 // 48 (height of each) * 8 (no. of items)
                                            }
                                        },
                                        classes: {paper: classes.selectCategoryMenu},
                                        transformOrigin: { horizontal: 'center', vertical: 'top'}
                                    }}
                                >
                                    <MenuItem value="" disabled>Select Category</MenuItem>
                                {
                                    this.state.categoryList.map(category => {
                                        return <MenuItem key={category} value={category}>{category.replace(/_/g, ' ').toUpperCase()}</MenuItem>
                                    })
                                }
                                </Select>
                        </FormControl>
                </div>
            </Modal>
            <br></br>
            <button onClick={this.logout} style={{marginTop:"25px"}} className="logoutButton">Log Out  <FiIcons.FiLogOut/></button>
            {
                this.state.loading ? (
                    <Backdrop className={classes.backdrop} open>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : null
            }
        </div>
        )
    }
}

export default withStyles(styles)(EnrollReg);