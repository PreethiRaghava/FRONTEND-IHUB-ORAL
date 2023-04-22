import React, { Component } from 'react';
import { AppBar, Chip, Checkbox, FormLabel, FormControlLabel, FormHelperText, FormGroup, Card, Paper, Toolbar, Typography, Button, IconButton, Divider, Container, TextField, Grid, FormControl, Select, InputLabel, MenuItem } from '@material-ui/core'
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import Axios from 'axios';
import './drive.css';

class AddAssistant extends Component {
    constructor(props) {
        super(props)
        this.state = {
            user: '',
            org_id: this.props.org_id,
            assist_array: [],
            all_assist_by_org: [],
        }
        this.discard = this.discard.bind(this)
        this.update = this.update.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange = (e) => {
        let a = e.target.name
        let b = this.state.assist_array;
        let c = []
        if (!b.includes(a)) {
            b.push(a)
            this.setState({ assist_array: b });
        }
        else {
            c = b.filter(aaa => aaa !== a)
            this.setState({ assist_array: c });
        }
    };
    update = async (e) => {
        let data = {
            driveID: this.props.drive_id,
            assist_list: this.state.assist_array
        }
        await Axios({
            method: "POST",
            url: "/drive/replaceassist",
            withCredentials: true,
            data: data
        })
            .then(res => {
                alert("Updated")
                this.props.handler()
            })
            .catch(err => {
                alert("Can't update. Try Again.")
            })

        // window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/driveinfo`;
    }
    discard = () => {
        window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/staff`;
    }
    async componentDidMount() {
        let assist_from_prop = [];
        for (let x in this.props.old) {
            assist_from_prop.push(this.props.old[x]._id)
        }
        this.setState({ assist_array: assist_from_prop })

        var data1;
        var data1arr = [];

        await Axios({
            method: "POST",
            url: "/assist/byorgid",
            withCredentials: true,
            data: { org_id: this.props.org_id }
        })
            .then(res => {
                data1 = res.data;
                for (let x in data1) {
                    let tmp = data1[x]
                    let new_name = "";
                    if (tmp.first_name !== "") new_name += (tmp.first_name + " ")
                    if (tmp.last_name !== "") new_name += (tmp.last_name + " ")
                    let pp = [];
                    pp.push(tmp._id)
                    pp.push(tmp.assist_id)
                    pp.push(new_name)
                    data1arr.push(pp)
                }
                this.setState({ all_assist_by_org: data1arr })
            })
            .catch(err => {
                console.log(err)
                alert("Not Authorized Login Again")
                // window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
            })
    }
    render() {
        return (
            <>
                <div className="drive">
                    <div className="drive-subtitle">Add Assistant</div>
                    <div className="drive-description" >Check all the Assistant you want to add for this drive.</div>
                    <div className="drive-form-inline">
                        <Container >
                            <br />
                            <FormControl component="fieldset" style={{ height: "300px", width: "100%", overflowY: "auto" }}>
                                <FormLabel component="legend">All Assistant for this organization</FormLabel>
                                <br />
                                <FormGroup>
                                    {
                                        this.state.all_assist_by_org.map((aa) => (
                                            <>

                                                <>{
                                                    this.state.assist_array.includes(aa[0]) &&
                                                    <FormControlLabel
                                                        control={<Checkbox checked={true} onChange={this.handleChange} name={aa[0]} />}
                                                        label={aa[2]}
                                                    />}
                                                </>
                                                <>
                                                    {!this.state.assist_array.includes(aa[0]) &&
                                                        <FormControlLabel
                                                            control={<Checkbox checked={false} onChange={this.handleChange} name={aa[0]} />}
                                                            label={aa[2]}
                                                        />}
                                                </>
                                            </>
                                        ))
                                    }
                                </FormGroup>
                            </FormControl>
                            <br />
                            <Typography variant="caption">* Can allocate stations to newly added assistant later.</Typography>
                            <br />
                            <br />

                            <Button align="center" variant="contained" fullWidth color="primary" onClick={(e) => { this.update(e) }} style={{ height: "100%", fontSize: "1rem" }}>Update</Button>
                        </Container>
                    </div>
                </div>
            </>
        );
    }
}

export default AddAssistant;
