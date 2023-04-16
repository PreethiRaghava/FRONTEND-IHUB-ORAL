import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './components/landingPage';
import RegisterForm from './components/register_form'
import LoginForm from './components/login_form';
import EnrollReg from './components/enroll_reg';
import EnrollLogin from './components/enroll_login';
import Patient from './components/Patient';
import PatientsAll from './components/patients_all';
import StationForm from './components/station_form';
import AdminDriveInfo from './components/adminDashboard/pages/adminDriveInfo';
import AdminLoginForm from './components/adminLogin';
import AdminAddStaff from './components/adminDashboard/pages/adminAddStaff';
import AdminStaff from './components/adminDashboard/pages/adminStaff';
import AdminDrive from './components/adminDashboard/pages/adminDrive';
import AdminAddDrive from './components/adminDashboard/pages/adminAddDrive';
import AdminDataForm from './components/adminDashboard/pages/adminDataForm';
import AdminAddDataForm from './components/adminDashboard/pages/adminAddDataForm';
import AdminReplaceDataForm from './components/adminDashboard/pages/adminReplace';

function App() {

  return (
    <Router basename={process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_URL_PREFIX_DEV : process.env.REACT_APP_URL_PREFIX_PROD}>
      <Switch>
        <Route path="/" exact component={LandingPage} />
        <Route path="/login" component={LoginForm} />
        <Route path="/enrollReg" render={props => <EnrollReg {...props} />} />
        <Route path="/register" component={RegisterForm} />
        <Route path="/admin" component={AdminLoginForm} />
        <Route path="/enroll" exact component={EnrollLogin} />
        <Route path="/patientsall" component={PatientsAll} />
        <Route path="/stationform" component={StationForm} />
        <Route path="/patient" exact render={props => <Patient {...props} />} />
        <Route path="/admindashboard/staff" component={AdminStaff} />
        <Route path="/admindashboard/addassistant" component={AdminAddStaff} />
        <Route path="/admindashboard/drives" component={AdminDrive} />
        <Route path="/admindashboard/adddrive" component={AdminAddDrive} />
        <Route path="/admindashboard/driveinfo" component={AdminDriveInfo} />
        <Route path="/admindashboard/dataforms" component={AdminDataForm} />
        <Route path="/admindashboard/replacedatafroms" component={AdminReplaceDataForm} />
        <Route path="/admindashboard/createdataform" component={AdminAddDataForm} />
      </Switch>
    </Router>

  );
}

export default App;
