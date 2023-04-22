import React, { Component } from 'react';
import Axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import BackArrow from './icons/backArrow.png';
import Phone from './icons/phone.png';
import Ellipse from './icons/ellipse.png';
import './enroll_login.css';
import { Backdrop, CircularProgress } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import firebase from './firebase'

const styles = theme => ({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
})

class AssistLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
            errorMsg: '',
            loading: false,
            timer_dict: { 0: 30, 1: 60, 2: 180, 3: 300 },
            counter: 0,
            counter_step: parseInt(localStorage.getItem("assist_login_counter_step")) || 0,
            otp_disable: parseInt(localStorage.getItem("assist_login_counter_step")) > 3
        }

    }//end constructor

    componentDidMount() {
        if (localStorage.getItem("assist_login_counter_step") == null || this.state.counter_step > 3) return
        this.setState({
            counter: this.state.timer_dict[this.state.counter_step],
            counter_step: this.state.counter_step + 1
        })
        this.startTimer()

    }//end componentDidMount

    configureCaptcha = () => {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
                this.sendotp()
                console.log("Recaptca verified")
            },
            defaultCountry: "IN"
        });
    }

    sendotp = (e) => {
        e.preventDefault();
        if (this.props.values.phone.length !== 10) {
            alert("Enter a 10 digit mobile number");
            return;
        }

        this.setState({ loading: true });

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
                console.log("before sending otp");
                firebase.auth().signInWithPhoneNumber(mobile_with_code, appVerifier)
                    .then((confirmationResult) => {
                        // SMS sent
                        window.confirmationResult = confirmationResult;
                        console.log("OTP has been sent")
                        localStorage.removeItem("assist_login_counter_step")
                        this.props.nextStep();
                    })
                    .catch(error => {
                        this.setState({ loading: false })
                        console.log('failed in firebase auth');
                        alert("OTP not sent")
                        var step = this.state.counter_step
                        this.setState({ counter_step: step + 1 })
                        localStorage.setItem("assist_login_counter_step", parseInt(step))
                        // this.setTimer()
                        // this.startTimer()
                        if (error.response) {
                            console.log(error.response.data);
                        }
                    });
            })
            .catch(error => {
                this.setState({ loading: false })
                if (error.response) {
                    console.log(error.response.data);
                }
            });

    }

    AlertDismissibleExample = (e) => {
        if (this.state.show) {
            return (
                <Alert className="text-center" position="absolute" variant="warning" onClose={() => this.setState({ show: false, errorMsg: '' })} dismissible>
                    <p>{this.state.errorMsg}</p>
                </Alert>
            );
        }
        return ({})

    }

    setTimer = () => {
        const counter_step = parseInt(localStorage.getItem("assist_login_counter_step"))
        if (counter_step <= 3) this.setState({ counter: this.state.timer_dict[counter_step] })
        else this.setState({ otp_disable: true })
    }

    startTimer = () => {
        var id = setInterval(() => {
            if (this.state.counter == 0) clearInterval(id);
            else this.setState({ counter: this.state.counter - 1 })
        }, 1000);
    }

    timerToString = secs => {
        var hours = Math.floor(secs / 3600);
        var mins = Math.floor(secs / 60) % 60;
        var seconds = secs % 60

        return [hours, mins, seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":")
    }

    home = e => {
        this.setState({ loading: true })
        window.location = `${process.env.REACT_APP_URL_PREFIX}`;
    }

    render() {
        const { values, handleChange, classes } = this.props;
        return (
            <div className="enrollLoginHomeStyle">
                <div className="enrollLoginTop">
                    <div className="header" style={{ marginTop: "55px" }}>
                        <button style={{ border: "none", background: "none", marginRight: "auto" }} onClick={this.home}>
                            <img className="backArrow" src={BackArrow} />
                        </button>
                        <label style={{ marginRight: "auto", fontWeight: "600", fontSize: "24px" }} className="formHeaders">Assistant Login</label>
                    </div>

                    <div className="phoneIconSet">
                        <img src={Phone} />
                        <img style={{ marginTop: "2px" }} src={Ellipse} />
                    </div>
                </div>

                <div className="enrollLoginBottom">
                    <label style={{ marginTop: "75px", fontWeight: "500", fontSize: "18px" }} className="formHeaders">May I ask your phone number?</label>
                    <input type="number" className="InputField" maxLength="10" placeholder="Enter Mobile Number" defaultValue={values.phone} onChange={handleChange('phone')} />
                    {this.state.counter > 0 && <><label style={{ marginTop: "10px" }} className="formHeaders">Resend in {this.timerToString(this.state.counter)}</label><br /></>}
                    <button
                        id="sign-in-button"
                        disabled={this.state.otp_disable || this.state.counter > 0}
                        className="nextButton"
                        style={{ marginTop: this.state.counter > 0 ? "20px" : "50px" }}
                        onClick={this.sendotp}
                    >
                        Next
                    </button>
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






} // end class Assistlogin

export default withStyles(styles)(AssistLogin);