import React, { Component } from 'react';
import Axios from 'axios';
import './patients_all.css';
import BackArrow from './icons/backArrow.png';
import Navbar from './navbar';
import { Row, Col, Form } from 'react-bootstrap';
import * as FiIcons from 'react-icons/fi';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import Fuse from 'fuse.js';

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
})

class PatientsAll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            errorMsg: '',
            patientList: [],
            patientListBackup: [],
            loading: false
        }
    }

    componentDidMount() {
        this.setState({ loading: true });
        Axios({
            method: "POST",
            url: process.env.REACT_APP_FLASK_URL + "/getpatients",
            data: {
                driveID: localStorage.getItem("drive_selected")
            },
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data.data);
                console.log("test1");
                this.setState({ loading: false });
                this.setState({
                    patientList: res.data.data["patient_list"],
                    patientListBackup: res.data.data["patient_list"],
                })
                console.log("test2");
            })

            .catch(error => {
                this.setState({ loading: false });
                if (error.response) {
                    console.log(error.response.data.msg);
                }
            });
    }

    fuzzySearch = e => {
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
        const result = fuse.search(e.target.value).map(x => x.item);
        this.setState({ patientList: result });
    }

    viewVisits = (e, patient_id) => {
        this.setState({ loading: true });
        this.props.history.push({
            pathname: '/patient',
            state: { patient_id: patient_id }
        })
    }

    exit = () => {
        this.setState({ loading: true });
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enroll`;
    }

    render() {
        const { classes, stationForm } = this.props;
        return (
            <div className="patientAllHomeStyle">

                {
                    stationForm ? null :
                        <>
                            <Navbar />
                            <div className="header">
                                <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.exit}>
                                    <img className="backArrow" src={BackArrow} />
                                </button>
                                <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px" }} className="formHeaders">Patients List</label>
                            </div>
                        </>
                }

                <input style={{ fontSize: "15px", marginBottom: "15px" }} className="InputField" placeholder="Search by Patient Name, ID or Mobile" onChange={this.fuzzySearch} />

                {
                    this.state.patientList.map(user => {
                        return (
                            <fieldset key={user.patient_id} className="accountCard">
                                <Form style={{ lineHeight: "30px", paddingTop: "10px" }} className="accountForm">
                                    <Row>
                                        <Col className="formHeaders" xs={6}>{user.first_name} {user.last_name}</Col>
                                        <Col className="formValues" xs={6}>
                                            <button className="accountButton" onClick={(e) => this.viewVisits(e, user.patient_id)}>Start</button>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="formHeaders" xs={6}>Patient ID</Col>
                                        <Col className="formValues" xs={6}>{user.patient_id}</Col>
                                    </Row>
                                    <Row>
                                        <Col className="formHeaders" xs={6}>Mobile:</Col>
                                        <Col className="formValues" xs={6}>{user.mobile_number}</Col>
                                    </Row>
                                </Form>
                            </fieldset>
                        )
                    })
                }

                <button onClick={this.exit} className="logoutButton">Exit  <FiIcons.FiLogOut /></button>

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

export default withStyles(styles)(PatientsAll);
