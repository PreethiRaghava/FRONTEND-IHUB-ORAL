import React, { Component } from 'react';
import Axios from 'axios';
import BackArrow from './icons/backArrow.png';
import './PatientSameMobile.css';
import Navbar from './navbar';
import { Row, Col, Form, Container } from 'react-bootstrap';
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

class PatientSameMobile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            errorMsg: '',
            users: [],
            usersBackup: [],
            loading: false
        }

    }//end constructor

    componentDidMount() {
        if (!this.props.values.mobile_number) return;
        this.setState({ loading: true });
        Axios({
            method: "POST",
            url: "/patient/samemobiledrive",
            data: {
                phonenumber: this.props.values.mobile_number,
                driveid: localStorage.getItem("drive_selected")
            },
            withCredentials: true
        })
            .then(res => {
                // console.log(res.data.data);
                this.setState({ loading: false });
                this.setState({
                    users: res.data.data,
                    usersBackup: res.data.data
                })
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
            this.setState({ users: this.state.usersBackup });
            return;
        }
        const options = {
            includeScore: true,
            shouldSort: true,
            keys: ["first_name", "last_name", "patient_id"]
        }

        const fuse = new Fuse(this.state.users, options)
        const result = fuse.search(e.target.value).map(x => x.item);
        this.setState({ users: result });
    }

    exit = e => {
        this.setState({ loading: true })
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enroll`;
    }

    viewVisits = (e, patient_id) => {
        e.preventDefault();
        this.setState({ loading: true });
        this.props.handlePatientId(patient_id);
        this.props.nextStep();
    }

    render() {
        const { mobile_number } = this.props.values;
        const { classes } = this.props;
        return (
            <div className="patientSameMobileHomeStyle">
                <Navbar />
                <div className="header">
                    <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.exit}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px" }} className="formHeaders">Account Details</label>
                </div>

                <label className="sameMobileText" style={{ marginBottom: "10px" }}>Mobile Number: <b>{mobile_number}</b></label>

                <input style={{ marginBottom: "15px" }} className="InputField" placeholder="Search by Patient Name or ID" onChange={this.fuzzySearch} />
                {
                    this.state.users.map(user => {
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

export default withStyles(styles)(PatientSameMobile);