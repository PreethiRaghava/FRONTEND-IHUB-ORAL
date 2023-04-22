import React, { Component } from 'react';
// import {useHistory} from 'react-router-dom';
import Axios from 'axios';
import { Alert } from 'react-bootstrap';
import './adminLogin.css';

class AdminLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      errorMsg: '',
      username: '',
      password: ''
    }

  }//end constructor

  componentDidMount() {


  }//end componentDidMount

  continue = (e) => {
    e.preventDefault();
    // AUTHENTICATE AND REDIRECT TO ADMIN DASHBOARD
    console.log("making call")
    Axios({
      method: "POST",
      url: "/admin/login",
      data: {
        username: this.state.username,
        password: this.state.password,
      },
      withCredentials: true,

    }).then(res => {
      console.log("push", res.data.org)
      let a = res.data.org.orgname
      let aa = res.data.org.orglogo
      let aaa = res.data.user.username
      console.log("push", res)
      localStorage.setItem("iiith-hcp-org_name", a)
      localStorage.setItem("iiith-hcp-org_logo", aa)
      localStorage.setItem("iiith-hcp-user_login", aaa)
      window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/drives`;
    })
      .catch(err => {
        console.log(err.response);
      });

  }

  handleChange = input => e => {
    this.setState({ [input]: e.target.value });
  }

  AlertDismissibleExample = (e) => {
    if (this.state.show) {
      return (
        <Alert variant="warning" onClose={() => this.setState({ show: false, errorMsg: '' })} dismissible>
          <p>{this.state.errorMsg}</p>
        </Alert>
      );
    }
    return ({})

  }


  render() {
    return (
      <div id="login">
        <div className="container">
          <div id="login-row" className="row justify-content-center align-items-center">
            <div id="login-column" className="col-md-6">
              <div id="login-box" className="col-md-12">
                <form id="login-form" className="form" onSubmit={this.continue}>
                  <h3 className="text-center">Login</h3>
                  <div className="form-group">
                    <label >Username:</label><br />
                    <input type="text" name="username" id="username" onChange={this.handleChange('username')} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label >Password:</label><br />
                    <input type="password" name="password" id="password" onChange={this.handleChange('password')} className="form-control" />
                  </div>
                  <div className="text-center form-group">
                    <input type="submit" name="submit" className="btn btn-success btn-md" value="Submit" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }//end render






} // end class admminLogin

export default AdminLogin;
