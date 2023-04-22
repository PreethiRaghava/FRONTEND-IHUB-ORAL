import React, { Component } from 'react';
import Axios from 'axios';
import './station_form.css';
import BackArrow from './icons/backArrow.png';
import Navbar from './navbar';
import * as FiIcons from 'react-icons/fi';
import {
    Backdrop, CircularProgress,
    Radio, RadioGroup, FormControl, FormLabel, FormControlLabel,
    Select, MenuItem, Grid, Modal, Container, TextField
} from '@material-ui/core';
import { Row, Col, Form } from 'react-bootstrap';
import { withStyles } from "@material-ui/core/styles";
import PatientForm from './patientForm';
import Fuse from 'fuse.js'
import ListAltIcon from '@material-ui/icons/ListAlt';

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    selectVisits: {
        background: "#10DDCD !important",
        borderRadius: "32px !important",
        color: "#05056B",
        minWidth: "150px",
        fontWeight: "600",
        paddingLeft: "10px",
        marginBottom: "10px"
    },
    selectVisitMenu: {
        marginTop: "5px",
        color: "#05056B",
        background: "#FFFEFE",
        borderRadius: "8px"
    },
    icon: {
        fill: "white",
    }
})


class StationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectCategory: localStorage.getItem("station_category"),
            inputType: 'ID',
            input: '',
            patientList: [],
            patientListBackup: [],
            patientFound: true,
            visitList: [],
            selectedPatient: {},
            visitNumber: '',
            showVisitList: false,
            showForm: false,
            patientFormValueProp: {},
            modal_open: false
        }
    }

    componentDidMount() {

    }

    exit = () => {
        this.setState({ loading: true });
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enrollReg`;
    }

    handleInputType = e => {
        this.setState({ inputType: e.target.value });
    }

    handleInput = e => {
        this.setState({ input: e.target.value })
    }

    patientSearch = () => {
        if (this.state.input.length !== 10 && this.state.input.length !== 12) {
            alert("Enter a 12 digit Patient ID or a 10 digit mobile number");
            return;
        }
        this.setState({
            loading: true,
            showVisitList: false,
            showForm: false,
            visitNumber: '',
            selectedPatient: {},
            selectedPatientId: ''
        })

        if (this.state.input.length === 12) {
            Axios({
                method: "POST",
                url: "/patient/check",
                data: {
                    loginid: this.state.input,
                    driveid: localStorage.getItem("drive_selected")
                },
                withCredentials: true
            })
                .then(res => {
                    this.setState({ loading: false })
                    let patientList = []
                    patientList.push(res.data.user)
                    this.setState({
                        modal_open: true,
                        patientList: patientList,
                        patientListBackup: patientList,
                        patientFound: true
                    })
                })
                .catch(error => {
                    this.setState({ loading: false })
                    console.log(error.response.data)
                    if (error.response.data.no_user) {
                        this.setState({
                            patientFound: false
                        })
                    }
                });
        }
        else if (this.state.input.length === 10) {
            //AXIOS CALL ON SAME MOBILE IN DRIVE
            Axios({
                method: "POST",
                url: "/patient/samemobiledrive",
                data: {
                    phonenumber: this.state.input,
                    driveid: localStorage.getItem("drive_selected")
                },
                withCredentials: true
            })
                .then(res => {
                    console.log(res.data.data);
                    this.setState({ loading: false })
                    if (res.data.data.length > 0) {
                        this.setState({
                            patientList: res.data.data,
                            patientListBackup: res.data.data,
                            patientFound: true,
                            modal_open: true
                        })
                    }
                    else {
                        this.setState({ patientFound: false })
                    }
                })
                .catch(error => {
                    this.setState({ loading: false })
                    if (error.response) {
                        console.log(error.response.data.msg);
                    }
                });
        }
    }

    getVisits = (patient_id) => {
        this.setState({ loading: true })
        Axios({
            method: "POST",
            url: "/patient/getvisitcount",
            data: {
                patient: patient_id,
            },
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data.data);
                this.setState({ loading: false })
                const visitList = []
                for (let i = 1; i <= res.data.data; i++) {
                    visitList.push(i.toString())
                }
                this.setState({
                    visitList: visitList,
                    showVisitList: true
                })
            })
            .catch(error => {
                this.setState({ loading: false })
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    viewAllPatients = () => {
        this.setState({ loading: true, modal_open: true })
        Axios({
            method: "POST",
            url: "/drive/getpatients",
            data: {
                driveID: localStorage.getItem("drive_selected")
            },
            withCredentials: true
        })
            .then(res => {
                console.log(res.data.data);
                this.setState({
                    loading: false,
                    patientFound: true,
                    patientList: res.data.data["patient_list"],
                    patientListBackup: res.data.data["patient_list"],
                    visitNumber: '',
                    showVisitList: false,
                    showForm: false,
                })
            })
            .catch(error => {
                this.setState({ loading: false });
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    selectPatient = (patient) => {
        this.setState({
            selectedPatient: patient,
            modal_open: false,
        });
        this.getVisits(patient.patient_id);
    }

    fuzzysearch = e => {
        if (!e.target.value.trim()) {
            this.setState({ patientList: this.state.patientListBackup });
            return;
        }

        const options = {
            includeScore: true,
            shouldSort: true,
            keys: ["first_name", "last_name", "patient_id", "mobile_number"]
        }
        const fuse = new Fuse(this.state.patientList, options)
        const result = fuse.search(e.target.value).map(x => x.item)
        this.setState({ patientList: result })
    }

    handleVisit = e => {
        let mobile_number = ''
        let selectedPatientId = this.state.selectedPatient["patient_id"]
        let userInfo = this.state.selectedPatient;
        userInfo.admin = false;
        userInfo.stationForm = true;
        userInfo.stationCategory = this.state.selectCategory;
        let selectedVisit = e.target.value;
        let values = { mobile_number, selectedPatientId, userInfo, selectedVisit }

        this.setState({
            visitNumber: e.target.value,
            patientFormValueProp: values,
            showForm: true
        })

    }
    titleCase = str => {
        return str.toLowerCase().split(' ').map(function (val) { return val.replace(val[0], val[0].toUpperCase()); }).join(' ');
    }

    render() {
        const { classes } = this.props;
        return (
            <div className="stationFormHomeStyle">
                <Navbar />
                <div className="header">
                    <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.exit}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "20px" }} className="formHeaders">Category: {this.titleCase(this.state.selectCategory.replace(/_/g, ' '))}</label>
                </div>
                <Container maxWidth="sm">
                    <Grid container spacing={1} alignItems="center">
                        <Grid item xs={10}>
                            <input type="number" className="InputField" style={{ width: "100%" }} placeholder="Enter Patient ID or Mobile Number" onChange={this.handleInput} />
                        </Grid>
                        <Grid item xs={2}>
                            <button onClick={this.viewAllPatients} style={{ border: "2px black", background: "none" }}>
                                <ListAltIcon color="primary" fontSize="large" />
                            </button>
                        </Grid>
                        <Grid item xs={5}>
                            <button className="nextButton" style={{ marginTop: "0px", marginBottom: "10px", width: "100%", padding: "2%", fontSize: "1rem" }} onClick={this.patientSearch}>Start</button>
                        </Grid>
                        <Grid item xs={1}>
                        </Grid>
                        <Grid item xs={6} >
                            <Select onChange={this.handleVisit}
                                value={this.state.visitNumber || ""}
                                MenuProps={{
                                    getContentAnchorEl: null,
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                    },
                                    classes: { paper: classes.selectVisitMenu },
                                }}
                                inputProps={{
                                    classes: {
                                        icon: classes.icon,
                                    },
                                }}
                                // className={classes.selectVisits}
                                displayEmpty
                                disableUnderline
                                className="nextButton"
                                style={{ width: "100%", marginTop: "0px", marginBottom: "10px", color: "white", padding: "2%", fontSize: "1rem", fontWeight: "600" }}
                            >
                                <MenuItem disabled value="">Select Visit</MenuItem>
                                {
                                    this.state.visitList.map(option => {
                                        return <MenuItem key={option} value={option}>{`Visit ${option}`}</MenuItem>
                                    })
                                }
                            </Select>
                        </Grid>
                    </Grid>

                    {
                        !this.state.patientFound && <label style={{ marginTop: "20px", fontWeight: "500", fontSize: "22px" }} className="formHeaders">No patient(s) found</label>
                    }

                    <Modal
                        open={this.state.modal_open}
                        onClose={() => this.setState({ modal_open: false })}
                    >
                        <div id="viewAllPatients">
                            <div id="modal-div-in">
                                <Container align="center">
                                    {
                                        this.state.loading ? <CircularProgress /> :
                                            <>
                                                {
                                                    this.state.patientFound &&
                                                    <>
                                                        <TextField fullWidth variant="outlined" className="op-wh" onChange={this.fuzzysearch} label="Search by Patient Name, ID or Mobile" ></TextField>
                                                        <br />
                                                        <br />
                                                        {
                                                            this.state.patientList.map(user => (
                                                                <fieldset key={user.patient_id} className="accountCard">
                                                                    <Form style={{ lineHeight: "30px", paddingTop: "10px" }} className="accountForm">
                                                                        <Row>
                                                                            <Col className="formHeaders" xs={6}>{user.first_name} {user.last_name}</Col>
                                                                            <Col className="formValues" xs={6}>
                                                                                <button className="accountButton" onClick={e => this.selectPatient(user)}>Start</button>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col className="formHeaders" xs={6}>Patient ID</Col>
                                                                            <Col className="formValues" xs={6}>{user.patient_id}</Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col className="formHeaders" xs={6}>Mobile Number:</Col>
                                                                            <Col className="formValues" xs={6}>{user.mobile_number}</Col>
                                                                        </Row>
                                                                    </Form>
                                                                </fieldset>
                                                            ))
                                                        }
                                                    </>
                                                }
                                            </>
                                    }
                                </Container>
                            </div>
                        </div>
                    </Modal>

                    {
                        !this.state.modal_open && this.state.showVisitList &&
                        <>
                            <div style={{ marginTop: "20px", borderRadius: "15px", border: "2px solid black", width: "100%", padding: "2%", backgroundColor: "white", overflow: "auto" }}>
                                {
                                    !this.state.showForm ?
                                        <h6 style={{ marginTop: "5px" }}>Select visit to proceed further</h6>
                                        :
                                        <PatientForm
                                            values={this.state.patientFormValueProp}
                                        />
                                }
                            </div>
                            <br />
                            <br />
                        </>
                    }
                    {
                        this.state.loading ? (
                            <Backdrop className={classes.backdrop} open>
                                <CircularProgress color="inherit" />
                            </Backdrop>
                        ) : null
                    }

                </Container>

            </div>
        )
    }
}

export default withStyles(styles)(StationForm);