import React, { Component } from 'react';
import { Button, TextField, Select, MenuItem, Divider, Container, InputLabel, OutlinedInput, FormControl, Grid } from '@material-ui/core';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import Axios from 'axios';
import './drive.css';

class AddStaff extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: '',
            org_id: '',
            assist_firstname: '',
            assist_middlename: '',
            assist_lastname: '',
            mobile_number: '',
            email: '',
        }
        this.discard_drive = this.discard_drive.bind(this)
        this.create_drive = this.create_drive.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange = (name, val) => {
        if (name === "assist_firstname") this.setState({ assist_firstname: val });
        if (name === "assist_middlename") this.setState({ assist_middlename: val });
        if (name === "assist_lastname") this.setState({ assist_lastname: val });
        if (name === "mobile_number") this.setState({ mobile_number: val });
        if (name === "email") this.setState({ email: val });
    };
    discard_drive = () => {
        window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admindashboard/staff`;
    }
    async create_drive(e) {
        e.preventDefault();
        if (!this.state.org_id) {
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admin`;
        }
        else {
            var collected_data = {
                first_name: this.state.assist_firstname,
                last_name: this.state.assist_lastname,
                mobile_number: this.state.mobile_number,
                email: this.state.email,
                org_id: this.state.org_id
            }
            await Axios({
                method: "POST",
                url: "/assist/register",
                withCredentials: true,
                data: collected_data
            })
                .then(res => {
                    console.log(res)
                    alert("Assistant Added")
                    window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admindashboard/staff`;
                })
                .catch(err => {
                    console.log(err)
                    alert("Can't add Assistant. Try again!")
                    window.location.reload()
                })
            // console.log(collected_data)
        }
    }
    async componentDidMount() {
        var user = ""
        await Axios({
            method: "GET",
            url: "/admin/user",
            withCredentials: true
        })
            .then(res => {
                user = res.data;
                this.setState({ user: user, org_id: user.msg.org_id })
            })
            .catch(err => {
                alert("Not Authorized Login Again")
                window.location = `${process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}/admin`;
            })
    }
    render() {
        return (
            <>
                <div className="drive">
                    <div className="drive-title">Add Medical Assistant</div>
                    <div className="drive-subtitle">Medical Assistant Essentials</div>
                    <div className="drive-description" >Fill the listed fields which will help you to register an Assistant and click on <strong>REGISTER</strong> to add new Assistant.</div>
                    <br />
                    <br />
                    <div className="drive-form-inline">
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <TextField id="outlined-basic" fullWidth name="assist_firstname" onChange={(e) => this.handleChange("assist_firstname", e.target.value)} label="First Name" variant="outlined" /><br /><br />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField id="outlined-basic" fullWidth name="assist_lastname" onChange={(e) => this.handleChange("assist_lastname", e.target.value)} label="Last Name" variant="outlined" /><br /><br />
                            </Grid>

                            <Grid item xs={5}>
                                <TextField id="outlined-basic" fullWidth name="mobile_number" onChange={(e) => this.handleChange("mobile_number", e.target.value)} label="Mobile Number" variant="outlined" /><br /><br />
                            </Grid>
                            <Grid item xs={7}>
                                <TextField id="outlined-basic" fullWidth name="email" onChange={(e) => this.handleChange("email", e.target.value)} label="Email" variant="outlined" /><br /><br />
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" onClick={this.create_drive} color="primary" startIcon={<CreateOutlinedIcon />}> Register </Button>
                            </Grid>
                            <Grid item xs={2}>
                                <Button variant="contained" onClick={this.discard_drive} color="secondary" startIcon={<ClearOutlinedIcon />}> Discard </Button>
                            </Grid>
                            <Grid item xs={4}>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </>
        );
    }
}

export default AddStaff;
