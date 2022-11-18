import React , {Component} from 'react';
import AssistLogin from './AssistLogin';
import AssistOtp from './AssistOtp';

class LoginForm extends Component{
constructor(props){
    super(props);

    this.state={
        step: 1,
        phone:'',
        otp:''
    }

}//end constructor

componentDidMount(){

    
}//end componentDidMount


prevStep = () => {
    const {step} = this.state;
    this.setState({
        step: step - 1
    })

}

nextStep = () => {
    const {step} = this.state;
    this.setState({
        step: step + 1
    })

}

handleChange = input => e => {
    this.setState({[input]: e.target.value});
}

render(){
    const {step,phone,otp} = this.state;
    const values = {phone,otp};

    switch(step){
        case 1:
            return (
               <AssistLogin
               nextStep={this.nextStep}
               handleChange={this.handleChange}
               values={values}
               /> 
            )
        case 2:
            return (
                <AssistOtp
               prevStep={this.prevStep}
               nextStep={this.nextStep}
               handleChange={this.handleChange}
               values={values}
               />
            )           
        
    }

    
}//end render






} // end class LoginForm

export default LoginForm;