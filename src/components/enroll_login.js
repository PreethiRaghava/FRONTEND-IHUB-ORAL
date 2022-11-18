import React , {Component} from 'react';
import Axios from 'axios';
import { withRouter } from "react-router-dom";
import {Button,Alert} from 'react-bootstrap';
import BackArrow from './icons/backArrow.png';
import Phone from './icons/phone.png';
import Ellipse from './icons/ellipse.png';
import './enroll_login.css';
import Navbar from './navbar';
import { Radio,RadioGroup,FormControl,FormLabel,FormControlLabel} from '@material-ui/core'
import {Backdrop,CircularProgress} from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import ListAltIcon from '@material-ui/icons/ListAlt';

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
})

class EnrollLogin extends Component{
constructor(props){
    super(props);
    this.state ={
        show: false,
        errorMsg: '',
        inputType: 'Mobile',
        input: "",
        loading: false
    }

}//end constructor

componentDidMount(){


}//end componentDidMount

back = () => {
    this.setState({loading:true})
    window.location = `${process.env.REACT_APP_URL_PREFIX}/enrollReg`;
}

patientLogin = (e) => {
    if(this.state.inputType === "Mobile" && this.state.input.length !== 10){
        alert("Enter a 10 digit mobile number");
        return;
    }
    if(this.state.inputType === "Patient_ID" && this.state.input.length !== 12){
        alert("Enter a 12 digit Patient ID");
        return;
    }
    this.setState({loading:true})
    e.preventDefault();
    console.log(`Input from enroll_login.js is:${this.state.input}`);

    //send verification request to backend server
    Axios({
        method: "POST",
        url: "/patient/check",
        data: {
            loginid: this.state.input,
            driveid: localStorage.getItem("drive_selected")
        }
    })
    //response status 200 meaning valid and registered phone number is entered
    .then(res => {
        if(this.state.inputType === "Mobile"){
            this.props.history.push({
                pathname:'/patient',
                state: {mobile_number: this.state.input}
            })
        } else {
            this.props.history.push({
                pathname:'/patient',
                state: {patient_id: this.state.input}
            })
        }
    })
    //response status 400
    //to enter a valid 10 digit phone number
    .catch(error => {
        this.setState({loading:false});
        console.log(error.response.data);
        if (error.response.data.no_user){
            if(this.state.inputType === "Mobile"){
                alert(`No user registered in the drive with mobile: ${this.state.input}`)
            }
            else {
                alert(`No user registered in the drive with patient id: ${this.state.input}`)
            }
        }
    });

}

viewAll = () => {
    this.setState({loading:true});
    window.location = `${process.env.REACT_APP_URL_PREFIX}/patientsall`;
}

AlertDismissibleExample = (e) => {
    if (this.state.show) {
      return (
        <Alert className="text-center" variant="warning" onClose={() => this.setState({show:false,errorMsg:''})} dismissible>
          <p>{this.state.errorMsg}</p>
        </Alert>
      );
    }
    return ({})

  }

  handleInputType = e => {
      this.setState({
        inputType: e.target.value
      })
  }

  handleInput = e => {
      this.setState({
          input: e.target.value
      })
  }

render(){
    const {classes} = this.props;
    return(
        <div className="enrollLoginHomeStyle">
            <div className="enrollLoginTop">
                <Navbar />
                <div className="header">
                    <button style={{border:"none",background:"none",marginRight:"auto"}} onClick={this.back}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{marginRight:"auto",fontWeight:"600",fontSize:"24px"}} className="formHeaders">Patient Screening</label>
                </div>

                <div className="phoneIconSet">
                    <img src={Phone} />
                    <img style={{marginTop:"2px"}} src={Ellipse} />
                </div>
            </div>

            <div className="enrollLoginBottom">

                <div style={{textAlign:"center",marginTop: "30px",width:"300px",color: "#05056B"}}>
                    <FormControl onChange={this.handleInputType}>
                        <FormLabel style={{fontWeight:"500",fontSize:"18px",color: "#05056B"}}>Please Select</FormLabel>
                        <RadioGroup row >
                            <FormControlLabel checked={this.state.inputType === "Patient_ID"} style={{fontWeight:"500",fontSize:"13px",lineHeight:"40px"}} value="Patient_ID" control={<Radio />} label="Patient ID" />
                            <FormControlLabel checked={this.state.inputType === "Mobile"} style={{fontWeight:"500",fontSize:"13px",lineHeight:"40px"}} value="Mobile" control={<Radio />} label="Mobile Number" />
                        </RadioGroup>
                    </FormControl>
                </div>

                <div>
                    <input type="number" className="InputField"
                    placeholder={this.state.inputType === "Mobile" ? "Enter Mobile Number" : "Enter Patient ID"}
                    onChange={this.handleInput} />

                    <button className="viewAll" onClick={this.viewAll}><ListAltIcon fontSize="large"/></button>
                </div>

                <button className="nextButton" style={{marginTop:"50px"}} onClick={this.patientLogin}>Next</button>

            </div>

            {
                this.state.loading ? (
                    <Backdrop className={classes.backdrop} open>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                ) : null
            }

        </div>

    )
}//end render






} // end class enrolllogin

export default withRouter(withStyles(styles)(EnrollLogin));