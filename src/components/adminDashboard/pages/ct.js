import React, { Component } from 'react';
import './dataForm.css';
import { Button, TextField, Divider, Chip } from '@material-ui/core';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import AutorenewOutlinedIcon from '@material-ui/icons/AutorenewOutlined';
import TreeData from '../../jsonFiles/meta_fin.json'
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 500,
        height: 400,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
    return [...a, ...not(b, a)];
}

function TransferList(props) {
    let dd = [];
    dd = props.props
    console.log(dd)
    const classes = useStyles();
    const [checked, setChecked] = React.useState([]);
    const [left, setLeft] = React.useState(props.props);
    const [right, setRight] = React.useState([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const customList = (title, items) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{ 'aria-label': 'all items selected' }}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} selected`}
            />
            <Divider />
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;
                    return (
                        <ListItem key={value} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={value} primary={value} />
                        </ListItem>
                    );
                })}
                <ListItem />
            </List>
        </Card>
    );

    return (
        <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
            className={classes.root}
        >
            <Grid item xs={5}>{customList('Choices', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="move selected right"
                    >
                        &gt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="move selected left"
                    >
                        &lt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item xs={5}>{customList('Chosen', right)}</Grid>
        </Grid>
    );
}

class TAddDataForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            nodes2: [],
            checked: [],
            expanded: [],
            form_name: '',
            description: '',
            tree: [],
            titles: [],
            selected_fields: [],
            load: "Loading..."
        }
        this.onCheck = this.onCheck.bind(this);
        this.onExpand = this.onExpand.bind(this);
        this.discard_form = this.discard_form.bind(this)
        this.preview_form = this.preview_form.bind(this)
        this.create_form = this.create_form.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange = (name, val) => {
        if (name === "form_name") this.setState({ form_name: val })
        else this.setState({ description: val })
    };
    discard_form = () => {
        window.location = `${process.env.REACT_APP_URL_PREFIX}/admindashboard/dataforms`;
    }
    create_form = () => {
        alert("add bk :{")
    }
    preview_form = () => {

    }
    onCheck(checked) {
        this.setState({ checked: checked });
    }
    onExpand(expanded) {
        this.setState({ expanded: expanded });
    }
    componentDidMount() {
        let nodes = [];
        let nodes2 = [];
        for (let x in TreeData) {
            let c = {
                value: "",
                label: "",
            }
            c.value = x
            c.label = x
            nodes.push(c)
            nodes2.push(x)
        }
        this.setState({ nodes: nodes })
        this.setState({ nodes2: nodes2 })
        console.log(nodes)
        this.setState({ load: '' })
    }
    render() {
        return (
            <>
                <div className="dataform">
                    <div className='df-create-section'>
                        <div className='df-form-gen'>
                            <div className="df-subtitle">Form Essentials</div>
                            <div className="df-description" >Fill the listed fields which will help you to identify this form later</div>
                            <div className="df-form-ess">
                                <TextField id="outlined-basic" name="form_name" onChange={(e) => this.handleChange("form_name", e.target.value)} label="Form Name" variant="outlined" /><br />
                                <TextField id="outlined-basic-large" name="description" onChange={(e) => this.handleChange("description", e.target.value)} label="Description" variant="outlined" />
                                <div className="df-create2"><Button variant="contained" onClick={this.create_form} color="primary" startIcon={<CreateOutlinedIcon />}> Create </Button></div>
                                <div className="df-create2"><Button variant="contained" onClick={this.discard_form} color="secondary" startIcon={<ClearOutlinedIcon />}> Discard </Button></div>
                            </div>
                            <div className="df-subtitle">Add fields</div>
                            <div className="df-description" >choose the listed fields which will be the part of form created</div>
                            {
                                this.state.load === "Loading..." ? <CircularProgress /> : <TransferList props={this.state.nodes2} />
                            }
                        </div>

                    </div>
                    <div className="df-end" ></div>
                    <div className="df-footer" ></div>
                </div>
            </>
        );
    }
}

export default TAddDataForm;
