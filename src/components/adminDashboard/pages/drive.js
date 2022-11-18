import React , {Component} from 'react';
import './drive.css';
import { DataGrid, GridColDef, GridApi, GridCellValue} from "@material-ui/data-grid";
import { Button } from '@material-ui/core';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import Axios from 'axios'

function parse_date(a){
    var d = new Date(a)
    var dformat = [d.getFullYear(),("00"+(d.getMonth()+1)).slice(-2),("00"+(d.getDate()+1)).slice(-2),].join('/')+' '+
                [("00"+(d.getHours()+1)).slice(-2),
                ("00"+(d.getMinutes()+1)).slice(-2),
                ("00"+(d.getSeconds()+1)).slice(-2)].join(':');
    return dformat
}
function dateToString(date){
    var formattedDate = new Date(date)
                        .toLocaleString('en-GB', {year: 'numeric', month: '2-digit', day: '2-digit'})
                        .replace(/(\d+)\/(\d+)\/(\d+)/, '$3/$2/$1');

    return formattedDate;
}
class Drive extends Component{
    constructor(props){
        super(props)
        this.state={
            columndata : [
                { field: 'drive_name', headerName: 'Drive Name', description: 'Name of Drive',headerAlign: 'left',width:350 ,align:'left',headerClassName: 'datagrid-header'},
                { field: 'location', headerName: 'Location',headerAlign: 'left',width:450,align:'left',headerClassName: 'datagrid-header' },
                { field: 'timestamp', headerName: 'Created On (YYYY/MM/DD)',headerAlign: 'left', description: 'Timestamp of drive creation (YYYY/MM/DD)',width:200,align:'left',headerClassName: 'datagrid-header' },
                { field: 'id', headerName: 'Options', hide: true ,headerAlign: 'center',width:0,headerClassName: 'datagrid-header'},
                {
                    field: "none",
                    headerName: "Options",
                    headerAlign: 'left',
                    width: 150,
                    headerClassName: 'datagrid-header',
                    align:'left',
                    description: 'Click corresponding button to view this drive',
                    disableClickEventBubbling: true,
                    renderCell: (params) => {
                        const onClick = () => {
                            const api = params.api;
                            const fields = api
                                .getAllColumns()
                                .map((c) => c.field)
                                .filter((c) => c !== "__check__" && !!c);
                                const thisRow = {};
                                let app_drive_id;
                            fields.forEach((f) => {
                                app_drive_id = params.row.id;
                            });
                            localStorage.setItem('drive_selected',app_drive_id)
                            localStorage.setItem('iiithcp-orgid',this.state.org_id)
                            window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/driveinfo`;
                        };
                        return <Button onClick={onClick} width='140' color="primary" variant="contained">View</Button>;
                    }
                },
            ],
            tabledata:[]
        }
    }
    async componentDidMount(){
        var user = ""
        await Axios({
            method:"GET",
            url:"/admin/user",
            withCredentials:true
        })
        .then(res=>{
            user=res.data;
            console.log(user)
            this.setState({user:user,org_id:user.msg.org_id})
        })
        .catch(err=>{
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        })
        await Axios({
            method:"POST",
            url:"/drive/allbyorgid",
            withCredentials:true,
            data:{org_id:user.msg.org_id}
        })
        .then(res=>{
            user=res.data.data;
            var dd = [];
            for(let i=0;i<user.length;i++)
            {
                let p = user[i]
                let pa = {id:p["_id"],drive_name:p["drive_name"],description:p["description"],timestamp: dateToString( p["timestamp"]),location:p["location"],org_id:p["org_id"],access_data:p["access_data"]}
                dd.push(pa);
            }
            dd.sort(function(a,b) {
                return b.timestamp.localeCompare(a.timestamp);
            });
            this.setState({tabledata:dd})
        })
        .catch(err=>{
            alert("Not Authorized Login Again")
            window.location = `${process.env.REACT_APP_URL_PREFIX}/admin`;
        })
    }
    render(){
        return (
            <>
                <div className="drive">
                    <div className="df-title">Drive</div>
                    <div className="df-subtitle">All Drives</div>
                    <div className="df-description" >Here are the lists of drives you have created earlier</div>
                    <div className="df-table" ><DataGrid rows={this.state.tabledata} columns={this.state.columndata} pageSize={5}/></div>
                    <div className="df-create-section">
                        <div className='df-subdes'>
                            <div className="df-subtitle">Want to add new Drive ?</div>
                            <div className="df-description" >Click on <b>ADD Drive</b> button to create new drive</div>
                        </div>
                        <div className="df-create"><Button href={`${process.env.REACT_APP_URL_PREFIX}/admindashboard/adddrive`} variant="contained" color="primary" startIcon={<NoteAddOutlinedIcon />}> Add Drive </Button></div>
                    </div>
                    <div className="df-end" ></div>
                    <div className="df-footer" ></div>
                </div>
            </>
        );
    }
}

export default Drive;
