import React , {Component} from 'react';
import Axios from 'axios';
import {Button,Alert} from 'react-bootstrap';
import './otp.css';
import Dial from './icons/dial.png';
import BackArrow from './icons/backArrow.png';
import {Backdrop,CircularProgress} from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import firebase from './firebase'

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
      },
})

class AssistOtp extends Component{
constructor(props){
    super(props);

    this.state ={
        show: false,
        errorMsg: '',
        otpArray: new Array(6).fill(""),
        loading: false
    }

}//end constructor

componentDidMount(){


}//end componentDidMount

back = () => {
    this.setState({loading:true});
    this.props.prevStep();
}

configureCaptcha = () =>{
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        this.sendotp();
        console.log("Recaptca verified")
      },
      defaultCountry: "IN"
    });
}

sendotp = (e) => {
    e.preventDefault();
    if(this.props.values.phone.length !== 10){
        alert("Enter a 10 digit mobile number");
        return;
    }
    this.setState({loading:true});

    Axios({
        method: "POST",
        url: "/assist/bymobile",
        data: {
            phonenumber: this.props.values.phone
        }
    })
    .then(res => {
        this.configureCaptcha();
        const appVerifier = window.recaptchaVerifier;
        const mobile_with_code = `+91${this.props.values.phone}`
        // firebase.auth().signInWithPhoneNumber(mobile_with_code, appVerifier)
        Axios({
            url: "http://localhost:6500/auth_phno",
            method: "POST",
            data: {'number':mobile_with_code},
          })
            .then((confirmationResult) => {
                // SMS sent
                this.setState({loading:false})
                window.confirmationResult = confirmationResult;
                alert("OTP has been sent");
                console.log("OTP has been sent")
            })
            .catch(error => {
                this.setState({loading:false})
                alert("OTP not sent. Try Again Later")
                if (error.response){
                    console.log(error.response.data);
                }
            });
    })
    .catch(error => {
        this.setState({loading: false})
        if (error.response){
            console.log(error.response.data);
        }
    });

}

verify = (e) => {
    e.preventDefault();
    const otp_code = this.state.otpArray.join("");
    if(otp_code.length !== 6){
        alert("Enter a valid OTP");
        return;
    }
    this.setState({loading:true})
    // window.confirmationResult.confirm(otp_code)
    Axios({
        url: "http://localhost:6500/auth_phno_otp",
        method: "POST",
        data: {'number':this.props.values.phone,'otp':otp_code},})
    .then((result) => {
        console.log("User is verified");
        localStorage.setItem('assist_mobile_number',this.props.values.phone)
        window.location = `${process.env.REACT_APP_URL_PREFIX}/enrollReg`;
    })
    .catch((error) => {
        this.setState({loading:false})
        alert("User verification failed")
        this.setState({
            otpArray: new Array(6).fill("")
        });
        if (error.response){
            console.log(error.response.data);
        }
    });

}

handleOtpChange = (element, index) => {
    if (isNaN(element.value) || element.value.length > 1) return false;
    this.setState({
        otpArray:[...this.state.otpArray.map((d, idx) => (idx === index ? element.value : d))]
    })

    if(!element.value){
        if(element.previousSibling) element.previousSibling.focus();
        else return false;
    }
    //Focus next input
    else if (element.nextSibling) {
        element.nextSibling.focus();
    }
};


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


render(){
    const {values,handleChange,classes} = this.props
    return(
        <div className="enrollOtpHomeStyle">
            <div className="enrollOtpTop" style={{height:"40vh"}}>
                <div className="header" style={{marginTop:"55px"}}>
                    <button style={{border:"none",background:"none",marginRight:"auto"}} onClick={this.back}>
                        <img className="backArrow" src={BackArrow} />
                    </button>
                    <label style={{marginRight:"auto",fontWeight:"600",fontSize:"24px"}} className="formHeaders">Verify</label>
                </div>

                <div className="otpSet" style={{marginBottom:"35px"}}>
                    <img src={Dial} />
                    <label style={{marginTop:"5px",fontWeight:"600",fontSize:"24px"}} className="formHeaders">OTP</label>
                </div>
            </div>

            <div className="enrollOtpBottom">
                <label style={{marginTop:"35px",fontWeight:"600",fontSize:"24px"}} className="formHeaders">Enter Verification Code</label>
                <label style={{fontWeight:"400",fontSize:"18px"}} className="formHeaders">Please enter the verification code sent to +91{this.props.values.phone}</label>

                <div style={{display:"flex",marginTop:"20px"}}>
                {
                    this.state.otpArray.map((data, index) => {
                        return (
                            <input
                                className="otp-field"
                                type="number"
                                key={index}
                                value={data}
                                onChange={e => this.handleOtpChange(e.target, index)}
                                onFocus={e => e.target.select()}
                            />
                        );
                    })
                }
                </div>

                {/* <label style={{marginTop:"20px",fontWeight:"400",fontSize:"18px"}} className="formHeaders">Didn't get the code?</label>
                <div id="sign-in-button">
                    <a style={{fontWeight:"600",fontSize:"18px"}} className="formHeaders" onClick={this.sendotp}>Resend Code</a>
                </div> */}
                <button className="verifyButton" onClick={this.verify}>Next</button>

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






} // end class AssistOtp

export default withStyles(styles)(AssistOtp);