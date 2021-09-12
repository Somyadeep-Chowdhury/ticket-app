
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import DashboardIcon from '@material-ui/icons/Dashboard';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import ListIcon from '@material-ui/icons/List';
import CreateIncident from "./CreateIncident";
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Allincidents from "./Allincidents";
import Issue from "./Issue";
import ViewListIcon from '@material-ui/icons/ListAlt';
import Profiles from "./Profiles";
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import GroupIcon from '@material-ui/icons/Group';
import FooterPage from "./Footer";
import LowPriority from '@material-ui/icons/LowPriority';
import AddIcon from '@material-ui/icons/Add';
import Addissue from "./Addissue";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import Upload from "./Upload";
import { IdleTimeOutModal } from './IdleModal'
import IdleTimer from 'react-idle-timer';
import Notification from './Notification'
import PopUpNotification from "./PopUpNotification";
import EmailPopUp from "./EmailPopUp";
import NotificationImportantIcon from '@material-ui/icons/NotificationImportant';
import AssessmentIcon from '@material-ui/icons/Assessment';
import AllNotification from "./AllNotification";
import { bindActionCreators } from "redux";
import { changeMenu } from '../actions/index';
import '../../src/App.css';
import '../styles/Footer.css';
import { ActionLog } from "./ActionLog";
import { Dashboard } from "./Dashboard";


const drawerWidth = 280;

const menusOptions = [
  {
    title: "Raise New Ticket",
    icon: <NoteAddIcon />
  }, {
    title: "My Ticket Logs",
    icon: <ListIcon />
  }
]
const TechOptions = [
  {
    title: "Raise New Ticket",
    icon: <NoteAddIcon />
  },
  {
    title: "My Ticket Logs",
    icon: <ListIcon />
  },
  {
    title: "My Queue",
    icon: <LowPriority />
  }
]
const SadminOptions = [
  {
    title: "Raise New Ticket",
    icon: <NoteAddIcon />,
    route: '/new-ticket'
  },
  {
    title: "My Ticket Logs",
    icon: <ListIcon />,
    route: '/my-tickets'
  },
  {
    title: "All Ticket Logs",
    icon: <ViewListIcon />,
    route: '/all-tickets'
  },
  {
    title: "Command Center",
    icon: < AssessmentIcon />,
    route: '/dashboard'
  },
  {
    title: "Profiles",
    icon: <GroupIcon />,
    route: '/profile'
  },
  {
    title: "Additional Tool Set",
    sections: [
      {
        name: "Notification",
        tabs: [
          { sub: 'Email Notification' },
          { sub: 'Pop-Up Notification' },
          { sub: 'Email & Pop-Up' }
        ],
        icon: <NotificationsNoneIcon />
      },
      {
        name: "Adding Issues",
        tabs: [],
        icon: <AddIcon />
      }
    ],
    icon: <DashboardIcon />,
    route: '/tools'
  },
  {
    title: "Upload",
    icon: <CloudUploadIcon />,
    route: '/upload'
  },
  {
    title: "All Notifications",
    icon: <NotificationImportantIcon />,
    route: '/notification-log'
  },
  {
    title: "Activity Log",
    icon: <SystemUpdateAltIcon />,
    route: '/action-log'
  }
]
const SuserOptions = [
  {
    title: "Raise New Ticket",
    icon: <NoteAddIcon />,
    route: '/new-ticket'
  },
  {
    title: "My Ticket Logs",
    icon: <ListIcon />,
    route: '/my-tickets'
  },
  {
    title: "All Ticket Logs",
    icon: <ViewListIcon />,
    route: '/all-tickets'
  },
  {
    title: "Profiles",
    icon: <GroupIcon />,
    route: '/profile'
  },
  {
    title: "Additional Tool Set",
    sections: [
      {
        name: "Notification",
        tabs: [
          { sub: 'Email Notification' },
          { sub: 'Pop-Up Notification' },
          { sub: 'Email & Pop-Up' }
        ],
        icon: <NotificationsNoneIcon />
      },
      {
        name: "Adding Issues",
        tabs: [],
        icon: <AddIcon />
      }
    ],
    icon: <DashboardIcon />,
    route: '/tools'
  }
]
const AdminOptions = [
  {
    title: "Raise New Ticket",
    icon: <NoteAddIcon />
  },
  {
    title: "My Ticket Logs",
    icon: <ListIcon />
  },
  {
    title: "Profiles",
    icon: <PersonAddIcon />
  },
]

const styles = theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBar1: {
    marginTop: '60px',
    backgroundColor: 'black !important',
  },
  appBarShift1: {
    marginLeft: drawerWidth,
    marginTop: '50px',
    width: `calc(100% - ${drawerWidth}px)`,
    backgroundColor: 'black !important',
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    zIndex: 100
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    zIndex: 100,
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    backgroundColor: 'black',
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
})
class Header extends Component {



  constructor(props) {
    super(props)

    this.state = {
      timeout: 1000 * 300 * 1,
      showModal: false,
      userLoggedIn: false,
      isTimedOut: false,
      open: true,
      menu: 'Raise New Ticket',
      name: "rightopen",
      options: "",
      menus: '',
      sub_tab: [],
      tab: ""
    }

    this.idleTimer = null
    this.onAction = this._onAction.bind(this)
    this.onActive = this._onActive.bind(this)
    this.onIdle = this._onIdle.bind(this)
    this.handleClose = this._handleClose.bind(this)
  }

  _onAction(e) {
    this.setState({ isTimedOut: false })
  }

  _onActive(e) {
    this.setState({ isTimedOut: false })
  }

  _onIdle(e) {
    const isTimedOut = this.state.isTimedOut

    if (isTimedOut === true) {
      this.setState({ showModal: false })
      window.location.reload()
      // this.props.history.push('/')
    } else {
      this.setState({ showModal: true })
      this.idleTimer.reset();
      this.setState({ isTimedOut: true })
    }

  }

  _handleClose() {
    this.setState({ showModal: false })
  }

  UNSAFE_componentWillMount() {
    if (this.props.user_details.role === "User") {
      this.setState({ options: menusOptions })
    }
    else if (this.props.user_details.role === "SME") {
      this.setState({ options: TechOptions })
    }
    else if (this.props.user_details.role === "Super Admin") {
      this.setState({ options: SadminOptions })
    }
    else if (this.props.user_details.role === "Admin") {
      this.setState({ options: AdminOptions })
    }
    else if (this.props.user_details.role === "Super User") {
      this.setState({ options: SuserOptions })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.menuData !== this.props.menuData && this.props.menuData.length !== 0) {
      this.handleMenu(this.props.menuData)
      setTimeout(() => {
        this.props.actions.changeMenu('')
      }, 2000)
    }
  }
  //logout function
  handleLogout() {
    window.location.reload('/');
  }

  handleDrawerOpen = () => {
    this.setState({ open: true, name: "rightopen", tabs: "" });
  };

  handleDrawerClose = () => {
    this.setState({ open: false, name: "rightclose", tabs: "tabClose" });
  };
  handleMenu = (menu) => {
    if (menu !== "Additional Tool Set") {
      this.setState({ menu: menu, menus: "", expandedPanel: "", sub_tab: [], tab: "" })
    } else {
      this.setState({ menu: menu })
    }
  }
  handleExpansionPanelChange = (panel) => (event, isExpanded) => {
    var selectedItem;
    if (panel === 'Additional Tool Set') {
      selectedItem = 'Notification'
    }
    // else {
    //   selectedItem = 'Home'
    // }
    let a = this.state.options
      .filter(x => x.title === panel)
      .map(y => y.sections ? y.sections : [])
    let b = a[0]
      .filter(u => u.name && u.name === selectedItem)
      .map(i => i.tabs ? i.tabs : [])

    if (isExpanded) {
      this.setState({ expandedPanel: panel, menu: panel, menus: selectedItem, sub_tab: b[0], tab: b[0].length > 0 ? b[0][0].sub : "" })
    }
    else {
      this.setState({ expandedPanel: false, menu: "", sub_tab: [], tab: "" })
    }
  };
  handleMenus = (menus) => {
    let a = this.state.options
      .filter(x => x.title === this.state.expandedPanel)
      .map(y => y.sections ? y.sections : [])
    let b = a[0]
      .filter(u => u.name && u.name === menus)
      .map(i => i.tabs ? i.tabs : [])

    this.setState({ menus: menus, sub_tab: b[0], tab: b[0].length > 0 ? b[0][0].sub : "" })
  }
  subTabChange = (sub) => {
    this.setState({ tab: sub })
  }
  render() {
    const { classes, theme } = this.props;
    const { open, options } = this.state;
    // console.log(this.props)
    // console.log(this.state)
    return (
      <div>
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: open,
            })}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                edge="start"
                className={clsx(classes.menuButton, {
                  [classes.hide]: open,
                })}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap className="heading">CPSD SelfDesk</Typography>
            </Toolbar>
          </AppBar>

          {this.state.sub_tab.length !== 0 &&
            <AppBar
              position="fixed"
              className={clsx(classes.appBar1, {
                [classes.appBarShift1]: open,
              })}
            >
              <Toolbar className={this.state.tabs}>
                {this.state.sub_tab && this.state.sub_tab.map((opt) => {
                  return (
                    <button key={opt.sub} className={this.state.tab === opt.sub ? 'activeclass' : 'nonactiveclass'}
                      onClick={e => this.subTabChange(opt.sub)}
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{opt.sub}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>
                  )
                })}
              </Toolbar>
            </AppBar>}

          <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              }),
            }}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={this.handleDrawerClose}><h6 className="menu-heading">Menu</h6>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon className="icon-color" />}
              </IconButton>
            </div>
            <Divider />
            <List className='main-uiList'>
              {options && options.map((opt, index) => (
                <div key={opt.title}>
                  {opt.title !== "Additional Tool Set" ?
                    <ListItem button className={this.state.menu === opt.title ? 'listactiveclass' : 'listnonactiveclass'} key={opt.title} onClick={e => this.handleMenu(opt.title)}>
                      <ListItemIcon>{opt.icon}</ListItemIcon>
                      <ListItemText primary={opt.title} />
                    </ListItem>
                    :
                    <ExpansionPanel expanded={this.state.expandedPanel === "Additional Tool Set"} onChange={this.handleExpansionPanelChange(opt.title)} className='head-acc'>
                      {this.state.open === true ?
                        <ExpansionPanelSummary expandIcon={<ExpandMore />} onClick={e => this.handleMenu(opt.title)} className='acc_summ'>
                          {opt.icon}&nbsp;&nbsp;&nbsp;   {opt.title}

                        </ExpansionPanelSummary>
                        :
                        <ExpansionPanelSummary expandIcon={<ExpandMore />} onClick={e => this.handleMenu(opt.title)}>
                          {opt.icon}

                        </ExpansionPanelSummary>
                      }
                      <ExpansionPanelDetails className='acc_details'>
                        <List>
                          {opt.sections && opt.sections.length > 0 && opt.sections.map((el, index) => (
                            <ListItem className={this.state.menus === el.name ? 'listactiveclass' : 'listnonactiveclass'} button key={el.name} onClick={e => this.handleMenus(el.name)}>
                              <ListItemIcon>{el.icon}</ListItemIcon>
                              <ListItemText primary={el.name} />
                            </ListItem>
                          ))}
                        </List>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  }
                </div>
              ))}
              <ListItem button onClick={e => this.handleLogout()}>
                <ListItemIcon><PowerSettingsNewIcon /></ListItemIcon>
                <ListItemText primary="Logout" ></ListItemText>
              </ListItem>
              {this.props.user_details.username !== "" ? <ListItem button className='profilemain'>
                <ListItemIcon className='profile-ico'><AccountCircleIcon /></ListItemIcon>
                <div className='profile-name'>
                  <ListItemText primary={this.props.user_details.username} ></ListItemText>
                  <ListItemText primary={" (" + this.props.user_details.role + ")"} ></ListItemText>
                </div>
              </ListItem> : ""}
            </List>
          </Drawer>
        </div>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          onAction={this.onAction}
          debounce={250}
          timeout={this.state.timeout} />
        <div className={this.state.name}>
          {this.state.menu === "Command Center" && <Dashboard />}
          {this.state.menu === "Raise New Ticket" && <CreateIncident />}
          {this.state.menu === "My Ticket Logs" && <Issue />}
          {(this.state.menu === "My Queue" || this.state.menu === "All Ticket Logs") && <Allincidents />}
          {(this.state.menu === "Profiles") && <Profiles />}
          {(this.state.menu === "Upload") && <Upload />}
          {(this.state.menu === "All Notifications") && <AllNotification />}

          {(this.state.menu === "Additional Tool Set" && this.state.menus === "Notification" && this.state.tab === "Email Notification" && <Notification />)}
          {(this.state.menu === "Additional Tool Set" && this.state.menus === "Notification" && this.state.tab === "Pop-Up Notification" && <PopUpNotification />)}
          {(this.state.menu === "Additional Tool Set" && this.state.menus === "Notification" && this.state.tab === "Email & Pop-Up" && <EmailPopUp />)}

          {(this.state.menu === "Additional Tool Set" && this.state.menus === "Adding Issues" && <Addissue />)}

          {(this.state.menu === "Activity Log") && <ActionLog />}
        </div>
        <IdleTimeOutModal
          showModal={this.state.showModal}
          handleClose={this.handleClose}
          handleLogout={this.handleLogout}
        />
        <FooterPage />
      </div>
    )
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};
const mapStateToProps = state => ({
  user_details: state.user.user_details,
  menuData: state.page.menuData,
});
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ changeMenu }, dispatch)
});
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles, { withTheme: true })(Header)))
